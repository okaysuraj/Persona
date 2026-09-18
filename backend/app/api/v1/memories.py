"""
Memory Vault API Endpoints.
Allows inspection, addition, and deletion of personal facts and memories.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.memory import UserFact, EpisodicMemory
from app.schemas.memory import UserFactCreate, UserFactResponse, EpisodicMemoryResponse

router = APIRouter(prefix="/memories", tags=["memories"])


@router.get("/persona/{persona_id}", response_model=Dict[str, Any])
async def get_persona_memories(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all facts and memories the AI companion has formed about the user."""
    facts_res = await db.execute(
        select(UserFact).where(
            UserFact.user_id == current_user.id,
            UserFact.persona_id == persona_id
        ).order_by(desc(UserFact.updated_at))
    )
    facts = facts_res.scalars().all()

    mems_res = await db.execute(
        select(EpisodicMemory).where(
            EpisodicMemory.user_id == current_user.id,
            EpisodicMemory.persona_id == persona_id
        ).order_by(desc(EpisodicMemory.created_at))
    )
    mems = mems_res.scalars().all()

    return {
        "facts": [
            {
                "id": f.id,
                "category": f.category,
                "key": f.key,
                "value": f.value,
                "confidence": f.confidence,
                "updated_at": f.updated_at.isoformat()
            } for f in facts
        ],
        "episodic_memories": [
            {
                "id": m.id,
                "summary": m.summary,
                "emotional_significance": m.emotional_significance,
                "created_at": m.created_at.isoformat()
            } for m in mems
        ]
    }


@router.post("/facts", response_model=UserFactResponse, status_code=status.HTTP_201_CREATED)
async def create_user_fact(
    persona_id: str,
    req: UserFactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually add or edit a fact in the companion's memory."""
    res = await db.execute(
        select(UserFact).where(
            UserFact.user_id == current_user.id,
            UserFact.persona_id == persona_id,
            UserFact.category == req.category,
            UserFact.key == req.key
        )
    )
    fact = res.scalar_one_or_none()
    if fact:
        fact.value = req.value
        fact.confidence = req.confidence or 1.0
    else:
        fact = UserFact(
            user_id=current_user.id,
            persona_id=persona_id,
            category=req.category,
            key=req.key,
            value=req.value,
            confidence=req.confidence or 1.0
        )
        db.add(fact)
    
    await db.commit()
    await db.refresh(fact)
    return fact


@router.delete("/facts/{fact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_fact(
    fact_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a fact from memory."""
    res = await db.execute(
        select(UserFact).where(UserFact.id == fact_id, UserFact.user_id == current_user.id)
    )
    fact = res.scalar_one_or_none()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    await db.delete(fact)
    await db.commit()
