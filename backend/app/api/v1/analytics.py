"""
Startup Analytics & Telemetry API for Persona AI.
Provides real-time business health, MRR, token unit economics, and safety metrics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.observability import observability
from app.models.user import User
from app.models.message import Message, Conversation
from app.models.persona import Persona

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
@router.get("")
@router.get("/", include_in_schema=False)
async def get_startup_dashboard(db: AsyncSession = Depends(get_db)):
    """
    Returns high-level business metrics, unit economics, and telemetry for founders.
    """
    # 1. User tier distribution & MRR calculation
    users_res = await db.execute(
        select(User.subscription_tier, func.count(User.id))
        .group_by(User.subscription_tier)
    )
    tier_counts = {tier: count for tier, count in users_res.all()}
    plus_count = tier_counts.get("plus", 0)
    vip_count = tier_counts.get("vip", 0)
    free_count = tier_counts.get("free", 0)
    total_users = sum(tier_counts.values())

    # MRR: Plus @ $14.99/mo, VIP @ $29.99/mo
    mrr_usd = (plus_count * 14.99) + (vip_count * 29.99)
    arr_usd = mrr_usd * 12

    # 2. Activity metrics
    convs_count_res = await db.execute(select(func.count(Conversation.id)))
    total_conversations = convs_count_res.scalar() or 0

    msgs_count_res = await db.execute(select(func.count(Message.id)))
    total_messages = msgs_count_res.scalar() or 0

    personas_count_res = await db.execute(select(func.count(Persona.id)))
    total_personas = personas_count_res.scalar() or 0

    # 3. Telemetry summary (tokens, costs, latency, safety)
    telemetry_data = observability.telemetry.get_summary()

    return {
        "status": "healthy",
        "business": {
            "mrr_usd": round(mrr_usd, 2),
            "arr_usd": round(arr_usd, 2),
            "total_users": total_users,
            "paying_subscribers": plus_count + vip_count,
            "tier_breakdown": {
                "free": free_count,
                "plus": plus_count,
                "vip": vip_count,
            },
            "conversion_rate_pct": round(((plus_count + vip_count) / max(total_users, 1)) * 100, 1),
        },
        "engagement": {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "active_personas": total_personas,
        },
        "llm_telemetry": telemetry_data,
    }
