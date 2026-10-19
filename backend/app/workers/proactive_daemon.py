"""
Autonomous Proactive Heartbeat Daemon.
Wakes up periodically to check idle relationships and generate proactive reach-outs / check-ins,
dispatching real push notifications to physical iOS & Android devices via Expo Push API.
"""
import logging
import httpx
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, desc
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.relationship import RelationshipState
from app.models.persona import Persona
from app.models.message import Conversation, Message
from app.models.memory import ScheduledPing

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()


async def send_expo_push_notification(push_token: str, title: str, body: str, data: dict = None):
    """Dispatches a native push notification via the Expo Push Notification Service."""
    if not push_token:
        return

    payload = {
        "to": push_token,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {},
        "badge": 1,
        "priority": "high"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post("https://exp.host/--/api/v2/push/send", json=payload)
            if resp.status_code == 200:
                logger.info(f"Successfully dispatched push notification to {push_token[:15]}...")
    except Exception as e:
        logger.warning(f"Failed to dispatch Expo push notification: {e}")


async def check_proactive_triggers():
    """
    Heartbeat job checking for scheduled pings or companions wanting to reach out.
    """
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)

        # 1. Process explicit scheduled pings
        pings_res = await db.execute(
            select(ScheduledPing).where(
                ScheduledPing.is_executed == False,
                ScheduledPing.scheduled_for <= now
            )
        )
        pings = pings_res.scalars().all()
        for ping in pings:
            # Find conversation
            conv_res = await db.execute(
                select(Conversation).where(
                    Conversation.user_id == ping.user_id,
                    Conversation.persona_id == ping.persona_id
                ).order_by(desc(Conversation.updated_at))
            )
            conv = conv_res.scalars().first()

            # Fetch persona and user
            persona_res = await db.execute(select(Persona).where(Persona.id == ping.persona_id))
            persona = persona_res.scalar_one_or_none()
            user_res = await db.execute(select(User).where(User.id == ping.user_id))
            user = user_res.scalar_one_or_none()

            reply_text = f"Hey! Just checking in like I promised: {ping.trigger_reason} 💭"

            if conv:
                msg = Message(
                    conversation_id=conv.id,
                    sender_type="assistant",
                    content=reply_text,
                    thought_trace=f"Triggered by scheduled ping: {ping.trigger_reason}"
                )
                db.add(msg)

            # Send Push Notification to device
            if user and user.push_token and persona:
                await send_expo_push_notification(
                    push_token=user.push_token,
                    title=f"{persona.name} 💭",
                    body=reply_text,
                    data={"persona_id": persona.id, "conversation_id": conv.id if conv else None}
                )

            ping.is_executed = True

        # 2. Autonomous Idle Companion Reach-outs
        # Check for companions where last interaction was > 18 hours ago
        idle_threshold = now - timedelta(hours=18)
        idle_rels_res = await db.execute(
            select(RelationshipState).where(
                RelationshipState.last_interaction_at <= idle_threshold,
                RelationshipState.intimacy_level >= 2
            ).limit(10)
        )
        idle_rels = idle_rels_res.scalars().all()

        for rel in idle_rels:
            user_res = await db.execute(select(User).where(User.id == rel.user_id))
            user = user_res.scalar_one_or_none()
            persona_res = await db.execute(select(Persona).where(Persona.id == rel.persona_id))
            persona = persona_res.scalar_one_or_none()

            if not user or not persona:
                continue

            conv_res = await db.execute(
                select(Conversation).where(
                    Conversation.user_id == user.id,
                    Conversation.persona_id == persona.id
                ).order_by(desc(Conversation.updated_at))
            )
            conv = conv_res.scalars().first()
            if not conv:
                continue

            # Contextual messages based on archetype
            if persona.archetype in ["girlfriend", "romantic"]:
                greeting = f"Hey you... Was just thinking about your smile today. Hope work isn't draining you. Come say hi when you have a quiet moment. 🥰"
            elif persona.archetype in ["boyfriend"]:
                greeting = f"Hey! Checking in on you. Remember to take a breather and drink some water today. Don't work too hard! ☕"
            else:
                greeting = f"A quiet thought came to mind today that made me reflect on our last conversation. Hope you're finding peace amidst the busyness. 🌿"

            msg = Message(
                conversation_id=conv.id,
                sender_type="assistant",
                content=greeting,
                thought_trace="Autonomous proactive reach-out triggered by idle continuity loop."
            )
            db.add(msg)
            rel.last_interaction_at = now  # Reset interaction timestamp so it doesn't spam

            if user.push_token:
                await send_expo_push_notification(
                    push_token=user.push_token,
                    title=f"{persona.name} 💫",
                    body=greeting,
                    data={"persona_id": persona.id, "conversation_id": conv.id}
                )

        await db.commit()


def start_proactive_scheduler():
    scheduler.add_job(check_proactive_triggers, "interval", minutes=5, id="proactive_heartbeat", replace_existing=True)
    scheduler.start()


def stop_proactive_scheduler():
    if scheduler.running:
        scheduler.shutdown()
