"""
Persona and Companion Management Endpoints.
"""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.v1.auth import get_current_user, get_optional_current_user
from app.models.user import User
from app.models.persona import Persona
from app.models.relationship import RelationshipState
from app.schemas.persona import PersonaCreate, PersonaUpdate, PersonaResponse, RelationshipResponse

router = APIRouter(prefix="/personas", tags=["personas"])


@router.get("/", response_model=List[PersonaResponse])
async def list_personas(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve all available companions (public system personas + user created)."""
    if current_user:
        query = select(Persona).where((Persona.is_public == True) | (Persona.user_id == current_user.id))
    else:
        query = select(Persona).where(Persona.is_public == True)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=PersonaResponse, status_code=status.HTTP_201_CREATED)
async def create_persona(
    req: PersonaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
    current_user: Optional[User] = Depends(get_optional_current_user)
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
    current_user: Optional[User] = Depends(get_optional_current_user)
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
