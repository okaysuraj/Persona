"""
Autonomous Proactive Heartbeat Daemon.
Wakes up periodically to check idle relationships and generate proactive reach-outs / check-ins.
"""
import asyncio
from datetime import datetime, timezone, timedelta
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select, desc
from app.core.database import AsyncSessionLocal
from app.models.relationship import RelationshipState
from app.models.persona import Persona
from app.models.message import Conversation, Message
from app.models.memory import ScheduledPing, UserFact

scheduler = AsyncIOScheduler()


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
            if conv:
                msg = Message(
                    conversation_id=conv.id,
                    sender_type="assistant",
                    content=f"Hey! Just checking in like I promised: {ping.trigger_reason} 💭",
                    thought_trace=f"Triggered by scheduled ping: {ping.trigger_reason}"
                )
                db.add(msg)
            ping.is_executed = True
        
        if pings:
            await db.commit()


def start_proactive_scheduler():
    scheduler.add_job(check_proactive_triggers, "interval", minutes=5, id="proactive_heartbeat", replace_existing=True)
    scheduler.start()


def stop_proactive_scheduler():
    if scheduler.running:
        scheduler.shutdown()
