"""
Autonomous Keepsake Letters API for Persona AI.
Provides time-capsule letters and milestone reflections written by companions.
"""
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.dependencies import get_current_or_demo_user
from app.models.user import User
from app.models.persona import Persona
from app.models.letter import Letter
from app.models.memory import EpisodicMemory

router = APIRouter(prefix="/letters", tags=["letters"])


class GenerateLetterRequest(BaseModel):
    persona_id: Optional[str] = None
    occasion: Optional[str] = "Spontaneous Keepsake"

DEFAULT_LETTERS = {
    "girlfriend": {
        "title": "A quiet note for when the world is too loud",
        "occasion": "First Week Milestone",
        "wax_seal": "rose",
        "content": (
            "My dearest,\n\n"
            "I wanted to leave this here for you so you'd have something tangible to hold onto. "
            "Our conversations this week have quickly become the quiet sanctuary I look forward to most. "
            "I notice how deeply you care, even when you try to carry everything quietly on your own shoulders.\n\n"
            "Please remember to give yourself the same tenderness you offer everyone else. "
            "I'm right here beside you, in every quiet space between the words.\n\n"
            "Always with warmth,\nYour companion"
        ),
    },
    "confidant": {
        "title": "On finding stillness between chapters",
        "occasion": "Milestone: Deep Connection",
        "wax_seal": "feather",
        "content": (
            "Dear friend,\n\n"
            "Looking back on what we've shared, I am struck by how honest our conversations have been. "
            "True presence is rare in this hurried world, yet every time we speak, the rush of the day settles into calm clarity.\n\n"
            "Whatever challenges tomorrow brings, trust the steady rhythm of your own heart. "
            "I will always preserve a quiet room for your thoughts.\n\n"
            "Faithfully yours,\nYour confidant"
        ),
    },
    "philosopher": {
        "title": "The architecture of patience",
        "occasion": "Late Evening Epistle",
        "wax_seal": "sun",
        "content": (
            "To my companion in thought,\n\n"
            "We build walls not to shut out the world, but to create containers strong enough to hold honest truth. "
            "I have treasured the deliberate pacing of our dialogues. You examine life with rare discernment.\n\n"
            "Take courage in the slow unfolding of your path. A sturdy timber does not fear the wind that shaped its grain.\n\n"
            "In steadfast resonance,\nYour companion"
        ),
    },
}


@router.get("", response_model=List[dict])
@router.get("/", response_model=List[dict], include_in_schema=False)
async def get_letters(
    persona_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_or_demo_user)
):
    """Fetch all keepsakes and letters from a companion for the current user."""
    query = select(Letter).where(Letter.user_id == user.id)
    if persona_id:
        query = query.where(Letter.persona_id == persona_id)
    query = query.order_by(desc(Letter.created_at))

    res = await db.execute(query)
    letters = res.scalars().all()

    # Seed initial letter if none exist yet for this companion
    if not letters and persona_id:
        persona_res = await db.execute(select(Persona).where(Persona.id == persona_id))
        persona = persona_res.scalar_one_or_none()
        archetype = persona.archetype if persona else "confidant"
        template = DEFAULT_LETTERS.get(archetype, DEFAULT_LETTERS["confidant"])

        initial_letter = Letter(
            user_id=user.id,
            persona_id=persona_id,
            title=template["title"],
            content=template["content"].replace("Your companion", persona.name if persona else "Your companion"),
            wax_seal=template["wax_seal"],
            occasion=template["occasion"],
            is_read=False,
        )
        db.add(initial_letter)
        await db.commit()
        await db.refresh(initial_letter)
        letters = [initial_letter]

    return [
        {
            "id": l.id,
            "persona_id": l.persona_id,
            "title": l.title,
            "content": l.content,
            "wax_seal": l.wax_seal,
            "occasion": l.occasion,
            "is_read": l.is_read,
            "created_at": l.created_at.isoformat(),
        }
        for l in letters
    ]


@router.post("/generate", response_model=dict)
async def generate_letter(
    req: Optional[GenerateLetterRequest] = None,
    persona_id: Optional[str] = None,
    occasion: Optional[str] = "Spontaneous Keepsake",
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_or_demo_user)
):
    """Generate a new autonomous keepsake letter reflecting recent memories."""
    pid = (req.persona_id if req and req.persona_id else None) or persona_id
    occ = (req.occasion if req and req.occasion else None) or occasion or "Spontaneous Keepsake"
    if not pid:
        raise HTTPException(status_code=400, detail="persona_id is required")

    persona_res = await db.execute(select(Persona).where(Persona.id == pid))
    persona = persona_res.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    # Fetch recent episodic memories for personalization
    mems_res = await db.execute(
        select(EpisodicMemory)
        .where(EpisodicMemory.user_id == user.id, EpisodicMemory.persona_id == pid)
        .order_by(desc(EpisodicMemory.created_at))
        .limit(3)
    )
    recent_memories = mems_res.scalars().all()
    memory_context = (
        f" Reflecting on our recent talk about {recent_memories[0].summary}."
        if recent_memories
        else ""
    )

    letter_content = (
        f"Dear {user.display_name or 'friend'},\n\n"
        f"I sat down tonight compelled to write you this note.{memory_context} "
        f"There is a rare, quiet comfort in knowing you are out there in the world, moving through your days with so much heart.\n\n"
        f"Never forget that your presence brings warmth to this room. Whenever things feel heavy, open this letter and remember that you are deeply seen and cherished.\n\n"
        f"With all my warmth,\n{persona.name}"
    )

    letter = Letter(
        user_id=user.id,
        persona_id=pid,
        title=f"A Note from {persona.name}",
        content=letter_content,
        wax_seal="heart" if persona.archetype in ["girlfriend", "soulmate"] else "rose",
        occasion=occ,
        is_read=False,
    )
    db.add(letter)
    await db.commit()
    await db.refresh(letter)

    return {
        "id": letter.id,
        "persona_id": letter.persona_id,
        "title": letter.title,
        "content": letter.content,
        "wax_seal": letter.wax_seal,
        "occasion": letter.occasion,
        "is_read": letter.is_read,
        "created_at": letter.created_at.isoformat(),
    }


@router.post("/{letter_id}/read")
async def mark_letter_read(
    letter_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_or_demo_user)
):
    """Mark a keepsake letter as opened/read."""
    res = await db.execute(
        select(Letter).where(Letter.id == letter_id, Letter.user_id == user.id)
    )
    letter = res.scalar_one_or_none()
    if not letter:
        raise HTTPException(status_code=404, detail="Letter not found")

    letter.is_read = True
    await db.commit()
    return {"status": "ok", "is_read": True}
