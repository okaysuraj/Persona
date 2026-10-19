"""Conversation persistence and the companion turn shared by chat and voice."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.graph import companion_graph
from app.core.observability import observability
from app.models.memory import EpisodicMemory, UserFact
from app.models.message import Conversation, Message
from app.models.persona import Persona
from app.models.relationship import RelationshipState
from app.models.user import User


async def _load_context(
    db: AsyncSession, user_id: str, persona_id: str
) -> tuple[RelationshipState, list[dict], list[dict]]:
    """Load or create the relationship and retrieve the companion's recall context."""
    result = await db.execute(
        select(RelationshipState).where(
            RelationshipState.user_id == user_id,
            RelationshipState.persona_id == persona_id
        )
    )
    rel = result.scalar_one_or_none()
    if not rel:
        rel = RelationshipState(user_id=user_id, persona_id=persona_id)
        db.add(rel)
        await db.commit()
        await db.refresh(rel)

    # Facts and the five most recent milestones form the recall context.
    facts_res = await db.execute(
        select(UserFact).where(
            UserFact.user_id == user_id,
            UserFact.persona_id == persona_id
        )
    )
    facts = [{"category": f.category, "key": f.key, "value": f.value} for f in facts_res.scalars().all()]

    mems_res = await db.execute(
        select(EpisodicMemory).where(
            EpisodicMemory.user_id == user_id,
            EpisodicMemory.persona_id == persona_id
        ).order_by(desc(EpisodicMemory.created_at)).limit(5)
    )
    mems = [{"summary": m.summary, "emotional_significance": m.emotional_significance} for m in mems_res.scalars().all()]

    return rel, facts, mems


def _update_relationship(rel: RelationshipState, persona: Persona, graph_result: dict) -> None:
    """Apply the graph's XP and mood changes to the existing relationship."""
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


async def _save_memories(db: AsyncSession, user_id: str, persona_id: str, graph_result: dict) -> None:
    """Merge extracted facts and queue any new milestone in the current transaction."""
    # Update matching facts rather than adding duplicates.
    for fact_data in graph_result.get("new_facts_extracted", []):
        fact_q = await db.execute(
            select(UserFact).where(
                UserFact.user_id == user_id,
                UserFact.persona_id == persona_id,
                UserFact.category == fact_data["category"],
                UserFact.key == fact_data["key"]
            )
        )
        existing_fact = fact_q.scalar_one_or_none()
        if existing_fact:
            existing_fact.value = fact_data["value"]
        else:
            db.add(UserFact(
                user_id=user_id,
                persona_id=persona_id,
                category=fact_data["category"],
                key=fact_data["key"],
                value=fact_data["value"]
            ))

    # Store a milestone only when the graph produced one.
    if graph_result.get("episodic_summary"):
        db.add(EpisodicMemory(
            user_id=user_id,
            persona_id=persona_id,
            summary=graph_result["episodic_summary"],
            emotional_significance=8
        ))


async def get_or_create_conversation(db: AsyncSession, user_id: str, persona_id: str) -> Conversation:
    """Reuse the most recently active conversation for this user and persona."""
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


async def execute_cognitive_cycle(
    db: AsyncSession,
    user: User,
    persona: Persona,
    conv: Conversation,
    user_text: str,
    media_type: str = "text",
    user_context: Optional[dict] = None,
    vision_data: Optional[dict] = None
):
    """Run one companion turn and persist its reply, memories, and relationship changes."""
    rel, facts, mems = await _load_context(db, user.id, persona.id)

    # Persist the incoming message even if the provider fails during this turn.
    user_msg = Message(
        conversation_id=conv.id,
        sender_type="user",
        content=user_text,
        media_type=media_type,
        metadata_json=vision_data or {}
    )
    db.add(user_msg)
    await db.commit()

    # The graph receives plain data and does not manage the database session.
    state_input = {
        "user_id": user.id,
        "persona_id": persona.id,
        "conversation_id": conv.id,
        "user_input": user_text,
        "input_media_type": media_type,
        "recent_messages": [],
        "user_context": user_context or {},
        "vision_data": vision_data or {},
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

    # Save the reply and its memory and relationship effects together.
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

    # Keep dashboard usage counts in sync with generated media.
    if media_action:
        media_type = media_action.get("type", "text")
        if media_type in ["selfie", "voice_note"]:
            observability.telemetry.record_multimodal(media_type, units=1.0)
        if media_action.get("is_crisis"):
            observability.telemetry.record_safety_alert(user.id, "crisis_self_harm")

    _update_relationship(rel, persona, graph_result)
    conv.updated_at = datetime.now(timezone.utc)
    await _save_memories(db, user.id, persona.id, graph_result)

    await db.commit()
    await db.refresh(asst_msg)
    return asst_msg
