"""
Memory Vault API Endpoints.
Allows inspection, addition, and deletion of personal facts and memories.
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.v1.auth import get_optional_current_user
from app.models.user import User
from app.models.memory import UserFact, EpisodicMemory
from app.schemas.memory import UserFactCreate, UserFactResponse, EpisodicMemoryResponse

router = APIRouter(tags=["memories"])


@router.get("/persona/{persona_id}", response_model=Dict[str, Any])
async def get_persona_memories(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve all facts and memories the AI companion has formed about the user."""
    user_id = current_user.id if current_user else None
    facts_query = select(UserFact).where(UserFact.persona_id == persona_id)
    mems_query = select(EpisodicMemory).where(EpisodicMemory.persona_id == persona_id)
    if user_id:
        facts_query = facts_query.where(UserFact.user_id == user_id)
        mems_query = mems_query.where(EpisodicMemory.user_id == user_id)

    facts_res = await db.execute(facts_query.order_by(desc(UserFact.updated_at)))
    facts = facts_res.scalars().all()

    mems_res = await db.execute(mems_query.order_by(desc(EpisodicMemory.created_at)))
    mems = mems_res.scalars().all()

    return {
        "facts": [
            {
                "id": f.id,
                "persona_id": f.persona_id,
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
                "persona_id": m.persona_id,
                "summary": m.summary,
                "emotional_significance": m.emotional_significance,
                "created_at": m.created_at.isoformat()
            } for m in mems
        ]
    }


@router.get("/facts", response_model=List[UserFactResponse])
async def get_user_facts(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve facts formed for a persona."""
    user_id = current_user.id if current_user else None
    query = select(UserFact).where(UserFact.persona_id == persona_id)
    if user_id:
        query = query.where(UserFact.user_id == user_id)
    query = query.order_by(desc(UserFact.updated_at))
    res = await db.execute(query)
    return res.scalars().all()


@router.get("/episodic", response_model=List[EpisodicMemoryResponse])
async def get_episodic_memories(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Retrieve episodic memories formed for a persona."""
    user_id = current_user.id if current_user else None
    query = select(EpisodicMemory).where(EpisodicMemory.persona_id == persona_id)
    if user_id:
        query = query.where(EpisodicMemory.user_id == user_id)
    query = query.order_by(desc(EpisodicMemory.created_at))
    res = await db.execute(query)
    return res.scalars().all()


@router.post("/facts", response_model=UserFactResponse, status_code=status.HTTP_201_CREATED)
async def create_user_fact(
    persona_id: str,
    req: UserFactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Manually add or edit a fact in the companion's memory."""
    if not current_user:
        res = await db.execute(select(User).where(User.email == "alex@companion.ai"))
        current_user = res.scalar_one_or_none()
        if not current_user:
            raise HTTPException(status_code=401, detail="User required to add facts")

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
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """Delete a fact from memory."""
    query = select(UserFact).where(UserFact.id == fact_id)
    if current_user:
        query = query.where(UserFact.user_id == current_user.id)
    res = await db.execute(query)
    fact = res.scalar_one_or_none()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    await db.delete(fact)
    await db.commit()
