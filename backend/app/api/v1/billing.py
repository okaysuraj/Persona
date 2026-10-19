"""
Billing, Subscriptions, and Monetization API.
Integrates Stripe for web checkout and manages user subscription quotas (Free, Plus, VIP).
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.api.dependencies import get_current_or_demo_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/billing", tags=["billing"])

TIER_LIMITS = {
    "free": {
        "tier_name": "Free Explorer",
        "price_monthly": 0,
        "max_messages_daily": 30,
        "max_voice_seconds_daily": 120,  # 2 mins
        "max_photos_monthly": 2,
        "llm_model": "Llama 3.3 70B (Fast)",
        "features": ["30 messages/day", "2 voice minutes/day", "Standard memory", "Web & mobile access"]
    },
    "plus": {
        "tier_name": "Persona Plus",
        "price_monthly": 14.99,
        "price_yearly": 99.00,
        "max_messages_daily": 999999,
        "max_voice_seconds_daily": 3600,  # 60 mins
        "max_photos_monthly": 30,
        "llm_model": "Claude 3.5 Haiku + Llama 70B",
        "features": ["Unlimited messages", "60 voice minutes/day", "30 custom photo snapshots", "Deeper memory recall", "Proactive check-ins"]
    },
    "vip": {
        "tier_name": "Persona VIP",
        "price_monthly": 29.99,
        "price_yearly": 240.00,
        "max_messages_daily": 999999,
        "max_voice_seconds_daily": 999999,  # Unlimited
        "max_photos_monthly": 999999,
        "llm_model": "Claude 3.5 Sonnet + GPT-4o",
        "features": ["Unlimited messages", "Unlimited duplex voice calls", "Unlimited custom snapshots", "Priority low-latency compute", "Custom voice cloning"]
    }
}


class CheckoutRequest(BaseModel):
    tier: str  # 'plus', 'vip'
    period: str = "monthly"  # 'monthly', 'yearly'
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


@router.get("/status")
async def get_billing_status(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Returns current user's subscription tier, quotas, and usage."""
    tier = current_user.subscription_tier if current_user else "free"
    tier_info = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    return {
        "user_id": current_user.id if current_user else "demo-user",
        "email": current_user.email if current_user else "alex@companion.ai",
        "subscription_tier": tier,
        "subscription_status": (current_user.subscription_status if current_user else "active") or "active",
        "tier_details": tier_info,
        "usage": {
            "messages_today": (current_user.messages_today if current_user else 0) or 0,
            "messages_limit": tier_info["max_messages_daily"],
            "voice_seconds_used": (current_user.voice_seconds_used if current_user else 0) or 0,
            "voice_seconds_limit": tier_info["max_voice_seconds_daily"],
            "photos_generated": (current_user.photos_generated_count if current_user else 0) or 0,
            "photos_limit": tier_info["max_photos_monthly"],
        },
        "available_tiers": TIER_LIMITS
    }


@router.post("/checkout-session")
async def create_checkout_session(
    req: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """
    Creates a Stripe Checkout Session or simulates instant test upgrade in demo mode.
    """
    if req.tier not in ["plus", "vip"]:
        raise HTTPException(status_code=400, detail="Invalid tier. Choose 'plus' or 'vip'.")

    # If Stripe API Key is configured, create live Stripe session
    if settings.STRIPE_SECRET_KEY:
        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY

            # Select price
            amount = 1499 if req.tier == "plus" else 2999
            if req.period == "yearly":
                amount = 9900 if req.tier == "plus" else 24000

            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "usd",
                        "product_data": {
                            "name": f"Persona AI — {TIER_LIMITS[req.tier]['tier_name']}",
                            "description": f"Subscription plan ({req.period})"
                        },
                        "unit_amount": amount,
                        "recurring": {"interval": "year" if req.period == "yearly" else "month"}
                    },
                    "quantity": 1,
                }],
                mode="subscription",
                customer_email=current_user.email,
                metadata={"user_id": current_user.id, "tier": req.tier},
                success_url=req.success_url or "http://localhost:5173/?billing=success",
                cancel_url=req.cancel_url or "http://localhost:5173/?billing=cancel",
            )
            return {"checkout_url": session.url, "mode": "stripe"}
        except Exception as e:
            logger.error(f"Stripe error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Instant Sandbox / Demo Upgrade mode for local development
    current_user.subscription_tier = req.tier
    current_user.subscription_status = "active"
    await db.commit()
    await db.refresh(current_user)

    return {
        "checkout_url": req.success_url or "/?billing=success",
        "mode": "demo_sandbox",
        "message": f"Successfully upgraded {current_user.email} to {req.tier.upper()} in development sandbox mode!"
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Handles asynchronous Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_WEBHOOK_SECRET:
        return {"status": "unconfigured"}

    try:
        import stripe
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        user_id = session_obj.get("metadata", {}).get("user_id")
        tier = session_obj.get("metadata", {}).get("tier", "plus")
        if user_id:
            user_res = await db.execute(select(User).where(User.id == user_id))
            user = user_res.scalar_one_or_none()
            if user:
                user.subscription_tier = tier
                user.subscription_status = "active"
                user.stripe_customer_id = session_obj.get("customer")
                await db.commit()

    return {"status": "success"}
