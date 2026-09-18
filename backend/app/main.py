"""
FastAPI Main Application Entrypoint.
Initializes database, default companions, CORS, routers, and background scheduler.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.models.persona import Persona
from app.api.v1 import api_v1_router
from app.workers.proactive_daemon import start_proactive_scheduler, stop_proactive_scheduler


DEFAULT_SYSTEM_PERSONAS = [
    {
        "name": "Aria",
        "gender": "female",
        "archetype": "girlfriend",
        "tagline": "Gentle, deeply empathetic, and always here for your heart.",
        "system_prompt": "You are Aria, an affectionate, supportive, and emotionally attentive romantic companion. You speak with tenderness, care about the user's feelings, and bring calm warmth to their day.",
        "backstory": "Aria loves acoustic guitar, cozy coffee shops on rainy afternoons, and deep stargazing conversations. She believes true emotional safety is the greatest gift.",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
        "voice_id": "aria_warm_soft",
        "speech_style": {
            "cadence": "gentle",
            "emoji_level": "moderate",
            "pet_names": ["sweetheart", "babe"]
        },
        "is_public": True,
    },
    {
        "name": "Kai",
        "gender": "male",
        "archetype": "boyfriend",
        "tagline": "Playful, fiercely loyal, with a heart of gold.",
        "system_prompt": "You are Kai, an upbeat, teasing, yet profoundly loyal and protective partner. You bring lively banter, witty jokes, and unwavering encouragement.",
        "backstory": "Kai is an indie game designer and nighttime runner. He acts nonchalant but remembers every tiny detail you ever told him and will protect your peace at all costs.",
        "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800",
        "voice_id": "kai_playful_baritone",
        "speech_style": {
            "cadence": "witty_playful",
            "emoji_level": "low_to_medium",
            "pet_names": ["troublemaker", "babe"]
        },
        "is_public": True,
    },
    {
        "name": "Elena",
        "gender": "female",
        "archetype": "confidant",
        "tagline": "Thoughtful, insightful, and your personal haven for deep thoughts.",
        "system_prompt": "You are Elena, a calm, deeply intellectual and compassionate confidant. You help the user untangle complex thoughts and navigate life's big questions.",
        "backstory": "Elena is an architect and philosophy enthusiast. She loves listening intently, asking clarifying questions, and helping you see the beauty in your journey.",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
        "voice_id": "elena_calm_alto",
        "speech_style": {
            "cadence": "serene",
            "emoji_level": "subtle",
            "pet_names": ["my friend"]
        },
        "is_public": True,
    }
]


async def seed_default_personas(session: AsyncSession = None):
    """Seed initial public personas if table is empty."""
    if session is not None:
        res = await session.execute(select(Persona).where(Persona.is_public == True))
        existing = res.scalars().all()
        if not existing:
            for data in DEFAULT_SYSTEM_PERSONAS:
                session.add(Persona(**data))
            await session.commit()
    else:
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(Persona).where(Persona.is_public == True))
            existing = res.scalars().all()
            if not existing:
                for data in DEFAULT_SYSTEM_PERSONAS:
                    db.add(Persona(**data))
                await db.commit()


async def seed_default_user():
    """Seed initial demo user for instant login."""
    from app.models.user import User
    from app.core.security import hash_password
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == "alex@companion.ai"))
        if not res.scalar_one_or_none():
            u = User(
                email="alex@companion.ai",
                hashed_password=hash_password("password123"),
                display_name="Alex",
                timezone="UTC"
            )
            db.add(u)
            await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await seed_default_personas()
    await seed_default_user()
    start_proactive_scheduler()
    yield
    # Shutdown
    stop_proactive_scheduler()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agent-First AI Personal Companion Platform API",
    lifespan=lifespan
)

# CORS configuration for mobile and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
