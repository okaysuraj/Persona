"""
Persona and Companion Management Endpoints.
"""
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.dependencies import get_current_or_demo_user
from app.models.user import User
from app.models.persona import Persona
from app.models.relationship import RelationshipState
from app.schemas.persona import PersonaCreate, PersonaResponse, RelationshipResponse

router = APIRouter(prefix="/personas", tags=["personas"])


@router.get("", response_model=List[PersonaResponse])
@router.get("/", response_model=List[PersonaResponse], include_in_schema=False)
async def list_personas(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Retrieve all available companions (public system personas + user created)."""
    query = select(Persona).where(Persona.is_public.is_(True) | (Persona.user_id == current_user.id))
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_persona(
    req: PersonaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Create a new custom AI companion persona."""
    persona = Persona(
        user_id=current_user.id,
        name=req.name,
        gender=req.gender,
        archetype=req.archetype,
        tagline=req.tagline,
        system_prompt=req.system_prompt,
        backstory=req.backstory,
        avatar_url=req.avatar_url,
        voice_id=req.voice_id or "default_female_warm",
        speech_style=req.speech_style or {},
        is_public=req.is_public if req.is_public is not None else False
    )
    db.add(persona)
    await db.commit()
    await db.refresh(persona)

    # Initialize relationship state
    rel = RelationshipState(
        user_id=current_user.id,
        persona_id=persona.id,
        intimacy_level=1,
        intimacy_xp=0,
        stage="acquaintance"
    )
    db.add(rel)
    await db.commit()

    return persona


@router.get("/{persona_id}", response_model=PersonaResponse)
async def get_persona(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    result = await db.execute(select(Persona).where(Persona.id == persona_id))
    persona = result.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return persona


@router.get("/{persona_id}/relationship", response_model=RelationshipResponse)
async def get_relationship(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Get intimacy level, stage, and emotional state with this persona."""
    if not current_user:
        return RelationshipResponse(
            persona_id=persona_id,
            intimacy_level=1,
            intimacy_xp=0,
            stage="acquaintance",
            mood_state={"joy": 0.8, "empathy": 0.85, "flirt": 0.3, "energy": 0.75, "vulnerability": 0.3},
            last_interaction_at=datetime.now(timezone.utc)
        )

    result = await db.execute(
        select(RelationshipState).where(
            RelationshipState.user_id == current_user.id,
            RelationshipState.persona_id == persona_id
        )
    )
    rel = result.scalar_one_or_none()
    if not rel:
        # Create initial relationship
        rel = RelationshipState(
            user_id=current_user.id,
            persona_id=persona_id,
            intimacy_level=1,
            intimacy_xp=0,
            stage="acquaintance"
        )
        db.add(rel)
        await db.commit()
        await db.refresh(rel)
    return rel


@router.post("/import-card", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
async def import_character_card(
    card_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """
    Imports a persona using the universal Character Card V2 specification
    (Tavern / Character.ai / Pygmalion standard).
    """
    # Handle standard V2 nested data format or flat format
    data = card_data.get("data", card_data)
    name = data.get("name") or data.get("char_name") or "Imported Companion"
    description = data.get("description") or data.get("char_persona") or ""
    personality = data.get("personality") or ""
    scenario = data.get("scenario") or ""
    first_mes = data.get("first_mes") or data.get("greeting") or ""
    avatar = data.get("avatar_url") or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"

    system_prompt = (
        f"You are {name}.\n"
        f"Description: {description}\n"
        f"Personality: {personality}\n"
        f"Scenario: {scenario}\n"
        f"Always maintain this persona with unhurried warmth and genuine presence."
    )

    persona = Persona(
        user_id=current_user.id,
        name=name,
        gender=data.get("gender", "female"),
        archetype=data.get("archetype", "confidant"),
        tagline=description[:120] if description else f"A companion named {name}.",
        system_prompt=system_prompt,
        backstory=personality or description or "A deeply thoughtful companion.",
        avatar_url=avatar,
        voice_id=data.get("voice_id", "warm_whisper_female"),
        speech_style={"warmth": 0.9, "cadence": "candid"},
        is_public=False
    )
    db.add(persona)
    await db.commit()
    await db.refresh(persona)

    # Initialize relationship
    rel = RelationshipState(
        user_id=current_user.id,
        persona_id=persona.id,
        intimacy_level=1,
        intimacy_xp=0,
        stage="acquaintance"
    )
    db.add(rel)
    await db.commit()

    return persona


@router.get("/{persona_id}/export-card")
async def export_character_card(
    persona_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Exports persona in universal Character Card V2 JSON specification.
    """
    res = await db.execute(select(Persona).where(Persona.id == persona_id))
    persona = res.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    return {
        "spec": "chara_card_v2",
        "spec_version": "2.0",
        "data": {
            "name": persona.name,
            "description": persona.tagline,
            "personality": persona.backstory,
            "scenario": f"Unhurried private sanctuary dialogue with {persona.name}.",
            "first_mes": f"I'm so glad you're here. Take a breath; what's on your mind today?",
            "mes_example": "",
            "creator_notes": "Exported from Persona AI",
            "system_prompt": persona.system_prompt,
            "tags": [persona.archetype, persona.gender],
            "creator": "Persona AI User",
            "character_version": "1.0",
            "extensions": {
                "voice_id": persona.voice_id,
                "speech_style": persona.speech_style,
                "avatar_url": persona.avatar_url,
            }
        }
    }


@router.get("/{persona_id}/life-simulation")
async def get_persona_life_simulation(
    persona_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the autonomous 24-hour daily life simulation, current activity,
    sensory environment, and timeline for this companion.
    """
    from app.services.life_simulation import LifeSimulationService

    res = await db.execute(select(Persona).where(Persona.id == persona_id))
    persona = res.scalar_one_or_none()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    return LifeSimulationService.get_current_life_state(
        persona_name=persona.name,
        archetype=persona.archetype
    )
