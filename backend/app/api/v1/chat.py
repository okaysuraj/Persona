"""
Realtime Chat and Streaming API.
Coordinates LangGraph execution, conversation persistence, memory consolidation, and WebSocket streaming.
"""
import json
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db, AsyncSessionLocal
from app.core.security import decode_access_token
from app.api.dependencies import get_current_or_demo_user
from app.models.user import User
from app.models.persona import Persona
from app.models.relationship import RelationshipState
from app.models.message import Conversation, Message
from app.schemas.chat import SendMessageRequest, MessageResponse, VisionInspectRequest, LoungeTurnRequest, LoungeTurnResponse, LoungePersonaTurn
from app.services.chat import get_or_create_conversation, execute_cognitive_cycle


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/send", response_model=MessageResponse)
async def send_message(
    req: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Send a message to a companion and return the agent's response."""
    persona_res = await db.execute(select(Persona).where(Persona.id == req.persona_id))
    persona = persona_res.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    if req.conversation_id:
        conv_res = await db.execute(select(Conversation).where(Conversation.id == req.conversation_id))
        conv = conv_res.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conv = await get_or_create_conversation(db, current_user.id, persona.id)

    user_ctx = req.user_context.model_dump() if req.user_context else None
    assistant_msg = await execute_cognitive_cycle(
        db=db,
        user=current_user,
        persona=persona,
        conv=conv,
        user_text=req.content,
        media_type=req.media_type or "text",
        user_context=user_ctx
    )
    return assistant_msg


@router.post("/inspect-vision", response_model=MessageResponse)
async def inspect_vision(
    req: VisionInspectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """
    Multimodal Visual Inspection ("See What I See"):
    User shares a photo (outfit, surroundings, artwork, view) for companion appraisal.
    """
    persona_res = await db.execute(select(Persona).where(Persona.id == req.persona_id))
    persona = persona_res.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    conv = await get_or_create_conversation(db, current_user.id, persona.id)
    user_ctx = req.user_context.model_dump() if req.user_context else None
    user_msg_content = req.user_question or "Look at what I'm seeing right now!"
    img_url = req.image_url or "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800"

    vision_meta = {"image_url": img_url, "question": user_msg_content}
    assistant_msg = await execute_cognitive_cycle(
        db=db,
        user=current_user,
        persona=persona,
        conv=conv,
        user_text=user_msg_content,
        media_type="image",
        user_context=user_ctx,
        vision_data=vision_meta
    )
    return assistant_msg


@router.post("/lounge/turn", response_model=LoungeTurnResponse)
async def lounge_group_turn(
    req: LoungeTurnRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """
    Multi-Persona Group Dynamics ("The Lounge"):
    Two or more companions engage with the user and banter thoughtfully with each other!
    """
    res = await db.execute(select(Persona).where(Persona.id.in_(req.persona_ids)))
    persona_map = {p.id: p for p in res.scalars().all()}
    personas = [persona_map[pid] for pid in req.persona_ids if pid in persona_map]
    if len(personas) < 2:
        raise HTTPException(status_code=400, detail="At least 2 valid personas required for The Lounge")

    turns: List[LoungePersonaTurn] = []

    for i, persona in enumerate(personas):
        conv = await get_or_create_conversation(db, current_user.id, persona.id)
        companion_prompt = req.content
        if i > 0 and turns:
            prev = turns[i - 1]
            companion_prompt = (
                f"{req.content}\n\n[In The Lounge, responding also to {prev.persona_name} who remarked: "
                f"'{prev.content[:100]}...']"
            )

        asst_msg = await execute_cognitive_cycle(
            db=db,
            user=current_user,
            persona=persona,
            conv=conv,
            user_text=companion_prompt,
            media_type="text"
        )

        turns.append(LoungePersonaTurn(
            persona_id=persona.id,
            persona_name=persona.name,
            avatar_url=persona.avatar_url,
            archetype=persona.archetype,
            content=asst_msg.content,
            thought_trace=asst_msg.thought_trace
        ))

    return LoungeTurnResponse(
        user_message=req.content,
        theme=req.theme or "fireside evening parlor",
        turns=turns,
        group_harmony_xp=25
    )


@router.get("/conversations/{persona_id}/messages", response_model=List[MessageResponse])
@router.get("/messages", response_model=List[MessageResponse], include_in_schema=False)
async def get_messages(
    persona_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    conv = await get_or_create_conversation(db, current_user.id, persona_id)
    res = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
        .limit(limit)
    )
    return res.scalars().all()


@router.websocket("/stream/{persona_id}")
async def websocket_chat(websocket: WebSocket, persona_id: str, token: Optional[str] = None):
    """
    Real-time streaming duplex WebSocket connection.
    Yields inner thought events, streaming tokens, emotion updates, and media.
    """
    await websocket.accept()

    # Authenticate token from query param
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    async with AsyncSessionLocal() as db:
        user_res = await db.execute(select(User).where(User.id == user_id))
        user = user_res.scalar_one_or_none()
        persona_res = await db.execute(select(Persona).where(Persona.id == persona_id))
        persona = persona_res.scalar_one_or_none()

        if not user or not persona:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        conv = await get_or_create_conversation(db, user.id, persona.id)

        try:
            while True:
                data = await websocket.receive_text()
                msg_payload = json.loads(data)
                user_text = msg_payload.get("content", "").strip()
                if not user_text:
                    continue

                # Notify client: Agent is thinking
                await websocket.send_json({"type": "status", "content": "thinking"})

                # Execute cycle
                asst_msg = await execute_cognitive_cycle(
                    db=db,
                    user=user,
                    persona=persona,
                    conv=conv,
                    user_text=user_text,
                    media_type=msg_payload.get("media_type", "text")
                )

                # Stream inner thought if available
                if asst_msg.thought_trace:
                    await websocket.send_json({
                        "type": "thought",
                        "content": asst_msg.thought_trace
                    })

                # Simulate token streaming for natural cadence
                words = asst_msg.content.split(" ")
                for i, word in enumerate(words):
                    chunk = word + (" " if i < len(words) - 1 else "")
                    await websocket.send_json({"type": "token", "content": chunk})
                    await asyncio.sleep(0.03)

                # Send media if present
                if asst_msg.media_type != "text" and asst_msg.media_url:
                    await websocket.send_json({
                        "type": "media",
                        "data": {
                            "media_type": asst_msg.media_type,
                            "media_url": asst_msg.media_url,
                            "metadata": asst_msg.metadata_json
                        }
                    })

                # Fetch updated relationship
                rel_res = await db.execute(
                    select(RelationshipState).where(
                        RelationshipState.user_id == user.id,
                        RelationshipState.persona_id == persona.id
                    )
                )
                rel = rel_res.scalar_one_or_none()
                if rel:
                    await websocket.send_json({
                        "type": "relationship_update",
                        "data": {
                            "intimacy_level": rel.intimacy_level,
                            "intimacy_xp": rel.intimacy_xp,
                            "stage": rel.stage,
                            "mood_state": rel.mood_state
                        }
                    })

                # Signal completion of turn
                await websocket.send_json({
                    "type": "done",
                    "message_id": asst_msg.id
                })

        except WebSocketDisconnect:
            pass
