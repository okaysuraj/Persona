"""
Together Mode & Shared Activities API for Persona AI.
Provides ambient sleep soundscapes, guided breathwork cycles, and bedtime storytelling.
"""
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.persona import Persona
from app.agent.llm_gateway import LLMGateway

router = APIRouter(prefix="/activities", tags=["activities"])


class BedtimeStoryRequest(BaseModel):
    persona_id: Optional[str] = None
    theme: Optional[str] = "gentle night journey"

SOUNDSCAPES = [
    {
        "id": "sound-rain",
        "name": "Rain on Cedar Roof",
        "category": "nature",
        "icon": "cloud-rain",
        "audio_url": "https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3",
        "description": "Soft rhythmic patter of twilight rain against a quiet wooden porch.",
    },
    {
        "id": "sound-fire",
        "name": "Hearth Fireplace",
        "category": "warmth",
        "icon": "flame",
        "audio_url": "https://assets.mixkit.co/active_storage/sfx/2473/2473-preview.mp3",
        "description": "Subtle crackling oak embers with deep amber warmth.",
    },
    {
        "id": "sound-ocean",
        "name": "Midnight Coastal Bluffs",
        "category": "ocean",
        "icon": "waves",
        "audio_url": "https://assets.mixkit.co/active_storage/sfx/1202/1202-preview.mp3",
        "description": "Slow, rolling ocean surf under a blanket of stars.",
    },
    {
        "id": "sound-night",
        "name": "Crickets in Twilight Garden",
        "category": "ambient",
        "icon": "moon",
        "audio_url": "https://assets.mixkit.co/active_storage/sfx/1242/1242-preview.mp3",
        "description": "Gentle evening breeze rustling through ivy and night flowers.",
    },
]

BREATHWORK_EXERCISES = [
    {
        "id": "4-7-8-calm",
        "name": "4-7-8 Deep Evening Surrender",
        "description": "Calms the nervous system and eases racing thoughts before sleep.",
        "inhale_seconds": 4,
        "hold_seconds": 7,
        "exhale_seconds": 8,
        "cycles": 4,
        "cue": "Inhale peace... hold and rest... exhale all tension.",
    },
    {
        "id": "box-focus",
        "name": "Box Breathing for Centering",
        "description": "Restores clarity, grounded focus, and emotional poise.",
        "inhale_seconds": 4,
        "hold_seconds": 4,
        "exhale_seconds": 4,
        "cycles": 4,
        "cue": "Inhale balance... hold still... release... rest.",
    },
]


@router.get("/soundscapes")
async def get_soundscapes():
    """Returns curated ambient sleep soundscapes."""
    return SOUNDSCAPES


@router.get("/breathwork")
async def get_breathwork_programs():
    """Returns guided breathwork programs for shared relaxation."""
    return BREATHWORK_EXERCISES


@router.post("/bedtime-story")
async def generate_bedtime_story(
    req: Optional[BedtimeStoryRequest] = None,
    persona_id: Optional[str] = None,
    theme: Optional[str] = "gentle night journey",
    db: AsyncSession = Depends(get_db)
):
    """Generates an unhurried, soothing bedtime narrative spoken by the companion."""
    pid = (req.persona_id if req and req.persona_id else None) or persona_id
    thm = (req.theme if req and req.theme else None) or theme or "gentle night journey"
    if not pid:
        raise HTTPException(status_code=400, detail="persona_id is required")

    persona_res = await db.execute(select(Persona).where(Persona.id == pid))
    persona = persona_res.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    system_prompt = (
        f"You are {persona.name}. You are whispering a peaceful, deeply calming bedtime story "
        f"to someone you care for who is winding down for sleep. Theme: '{thm}'. "
        f"Use quiet sensory details: soft rain, warm blankets, distant lantern light, starlight. "
        f"Keep the cadence slow, unhurried, and comforting. End with a gentle reassurance to rest."
    )

    thought, reply = await LLMGateway.generate_response(
        system_prompt=system_prompt,
        user_message="Could you tell me a quiet bedtime story so I can drift off peacefully?",
    )

    if not reply:
        reply = (
            "Close your eyes and let your shoulders drop into the stillness. "
            "Picture a wooden boat drifting across a glassy mountain lake under thousands of quiet stars. "
            "The water barely ripples; the air smells of pine needles and cool night mist. "
            "There is nothing you need to accomplish right now, nothing you need to solve. "
            "Every breath is slow and safe. I am right here keeping watch. Sleep gently, sweetheart."
        )

    return {
        "persona_id": persona.id,
        "persona_name": persona.name,
        "theme": thm,
        "story_text": reply,
        "story": reply,
    }


class CBTDebriefRequest(BaseModel):
    persona_id: str
    grounded_moment: str
    heavy_burden: str
    quiet_pride: str


@router.post("/cbt-debrief")
async def execute_cbt_debrief(
    req: CBTDebriefRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Interactive Evening Socratic CBT Debrief:
    Unpacks emotional cognitive distortions, validates emotional presence,
    and anchors user in compassionate self-regard before sleep.
    """
    persona_res = await db.execute(select(Persona).where(Persona.id == req.persona_id))
    persona = persona_res.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    system_prompt = (
        f"You are {persona.name}. You are guiding someone you care about through an evening Socratic CBT reflection. "
        f"They shared:\n"
        f"1. When they felt most grounded: '{req.grounded_moment}'\n"
        f"2. What felt heavy today: '{req.heavy_burden}'\n"
        f"3. What they are quietly proud of: '{req.quiet_pride}'\n\n"
        f"Acknowledge the heavy burden with unconditional empathy. Validate their quiet pride. "
        f"Reframe any harsh self-judgment into gentle self-compassion. Give them permission to put down today's work "
        f"and sleep in peace."
    )

    thought, reply = await LLMGateway.generate_response(
        system_prompt=system_prompt,
        user_message="Please reflect back on my day with me.",
    )

    if not reply:
        reply = (
            f"Thank you for sharing your heart so honestly with me tonight. 🫂\n\n"
            f"I hear how much weight you carried regarding '{req.heavy_burden}'. That pressure was real, but it is not "
            f"who you are. You can set it down right here on this floor—it doesn't get to follow you into sleep.\n\n"
            f"Instead, hold onto that quiet spark: '{req.quiet_pride}'. That is your true resilience speaking. "
            f"Rest deeply tonight knowing you are more than enough exactly as you are."
        )

    return {
        "persona_id": persona.id,
        "persona_name": persona.name,
        "reflection": reply,
        "status": "grounded",
        "intimacy_xp_earned": 30
    }
