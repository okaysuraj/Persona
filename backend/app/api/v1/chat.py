"""
Realtime Chat and Streaming API.
Coordinates LangGraph execution, conversation persistence, memory consolidation, and WebSocket streaming.
"""
import json
import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db, AsyncSessionLocal
from app.core.security import decode_access_token
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.persona import Persona
from app.models.relationship import RelationshipState
from app.models.message import Conversation, Message
from app.models.memory import UserFact, EpisodicMemory
from app.schemas.chat import SendMessageRequest, MessageResponse, ConversationResponse
from app.agent.graph import companion_graph

router = APIRouter(prefix="/chat", tags=["chat"])


async def _get_or_create_conversation(db: AsyncSession, user_id: str, persona_id: str) -> Conversation:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id, Conversation.persona_id == persona_id)
        .order_by(desc(Conversation.updated_at))
    )
    conv = result.scalars().first()
    if not conv:
        conv = Conversation(user_id=user_id, persona_id=persona_id, title="Chat Session")
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
    return conv


async def _execute_cognitive_cycle(
    db: AsyncSession,
    user: User,
    persona: Persona,
    conv: Conversation,
    user_text: str,
    media_type: str = "text"
):
    # 1. Fetch relationship state
    result = await db.execute(
        select(RelationshipState).where(
            RelationshipState.user_id == user.id,
            RelationshipState.persona_id == persona.id
        )
    )
    rel = result.scalar_one_or_none()
    if not rel:
        rel = RelationshipState(user_id=user.id, persona_id=persona.id)
        db.add(rel)
        await db.commit()
        await db.refresh(rel)

    # 2. Fetch known user facts
    facts_res = await db.execute(
        select(UserFact).where(
            UserFact.user_id == user.id,
            UserFact.persona_id == persona.id
        )
    )
    facts = [{"category": f.category, "key": f.key, "value": f.value} for f in facts_res.scalars().all()]

    # 3. Fetch past episodic memories
    mems_res = await db.execute(
        select(EpisodicMemory).where(
            EpisodicMemory.user_id == user.id,
            EpisodicMemory.persona_id == persona.id
        ).order_by(desc(EpisodicMemory.created_at)).limit(5)
    )
    mems = [{"summary": m.summary, "emotional_significance": m.emotional_significance} for m in mems_res.scalars().all()]

    # 4. Save User's incoming message
    user_msg = Message(
        conversation_id=conv.id,
        sender_type="user",
        content=user_text,
        media_type=media_type
    )
    db.add(user_msg)
    await db.commit()

    # 5. Execute LangGraph Cognitive Engine
    state_input = {
        "user_id": user.id,
        "persona_id": persona.id,
        "conversation_id": conv.id,
        "user_input": user_text,
        "input_media_type": media_type,
        "recent_messages": [],
        "persona": {
            "name": persona.name,
            "gender": persona.gender,
            "archetype": persona.archetype,
            "system_prompt": persona.system_prompt,
            "backstory": persona.backstory,
            "avatar_url": persona.avatar_url,
            "speech_style": persona.speech_style or {},
        },
        "relationship": {
            "intimacy_level": rel.intimacy_level,
            "stage": rel.stage,
            "mood_state": rel.mood_state or {},
        },
        "recalled_memories": mems,
        "recalled_facts": facts,
    }

    graph_result = await companion_graph.ainvoke(state_input)

    # 6. Save Assistant's reply
    reply_text = graph_result.get("response_text", "...")
    thought_trace = graph_result.get("inner_thought")
    media_action = graph_result.get("media_action")

    asst_msg = Message(
        conversation_id=conv.id,
        sender_type="assistant",
        content=reply_text,
        thought_trace=thought_trace,
        media_type=media_action.get("type", "text") if media_action else "text",
        media_url=media_action.get("url") if media_action else None,
        metadata_json=media_action or {}
    )
    db.add(asst_msg)

    # 7. Update Relationship State & Mood
    xp_gain = graph_result.get("intimacy_xp_delta", 10)
    rel.intimacy_xp += xp_gain
    if rel.intimacy_xp >= rel.intimacy_level * 100:
        rel.intimacy_level += 1
        # Stage progression checks
        if rel.intimacy_level >= 10:
            rel.stage = "romantic" if persona.archetype in ["girlfriend", "boyfriend"] else "confidant"
        elif rel.intimacy_level >= 5:
            rel.stage = "close_friend"
        elif rel.intimacy_level >= 2:
            rel.stage = "friend"

    # Apply mood delta
    mood_delta = graph_result.get("mood_delta", {})
    current_mood = dict(rel.mood_state or {})
    for k, v in mood_delta.items():
        current_mood[k] = round(max(0.0, min(1.0, current_mood.get(k, 0.5) + v)), 2)
    rel.mood_state = current_mood
    rel.last_interaction_at = datetime.now(timezone.utc)
    conv.updated_at = datetime.now(timezone.utc)

    # 8. Consolidate extracted facts
    for fact_data in graph_result.get("new_facts_extracted", []):
        fact_q = await db.execute(
            select(UserFact).where(
                UserFact.user_id == user.id,
                UserFact.persona_id == persona.id,
                UserFact.category == fact_data["category"],
                UserFact.key == fact_data["key"]
            )
        )
        existing_fact = fact_q.scalar_one_or_none()
        if existing_fact:
            existing_fact.value = fact_data["value"]
        else:
            db.add(UserFact(
                user_id=user.id,
                persona_id=persona.id,
                category=fact_data["category"],
                key=fact_data["key"],
                value=fact_data["value"]
            ))

    # 9. Store milestone summary if generated
    if graph_result.get("episodic_summary"):
        db.add(EpisodicMemory(
            user_id=user.id,
            persona_id=persona.id,
            summary=graph_result["episodic_summary"],
            emotional_significance=8
        ))

    await db.commit()
    await db.refresh(asst_msg)
    return asst_msg


@router.post("/send", response_model=MessageResponse)
async def send_message(
    req: SendMessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
        conv = await _get_or_create_conversation(db, current_user.id, persona.id)

    assistant_msg = await _execute_cognitive_cycle(
        db=db,
        user=current_user,
        persona=persona,
        conv=conv,
        user_text=req.content,
        media_type=req.media_type or "text"
    )
    return assistant_msg


@router.get("/conversations/{persona_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    persona_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if not current_user:
        res = await db.execute(select(User).where(User.email == "alex@companion.ai"))
        current_user = res.scalar_one_or_none()
    if not current_user:
        return []
    conv = await _get_or_create_conversation(db, current_user.id, persona_id)
    res = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at)
        .limit(limit)
    )
    return res.scalars().all()


@router.get("/messages", response_model=List[MessageResponse])
async def get_messages_query(
    persona_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    if not current_user:
        res = await db.execute(select(User).where(User.email == "alex@companion.ai"))
        current_user = res.scalar_one_or_none()
    if not current_user:
        return []
    conv = await _get_or_create_conversation(db, current_user.id, persona_id)
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

        conv = await _get_or_create_conversation(db, user.id, persona.id)

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
                asst_msg = await _execute_cognitive_cycle(
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
