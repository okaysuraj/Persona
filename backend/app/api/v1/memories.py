"""
Memory Vault API Endpoints.
Allows inspection, addition, and deletion of personal facts and memories.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.api.dependencies import get_current_or_demo_user
from app.models.user import User
from app.models.memory import UserFact, EpisodicMemory, TemporalMemoryNode, UserPsychometrics
from app.schemas.memory import (
    UserFactCreate,
    UserFactResponse,
    EpisodicMemoryResponse,
    TemporalMemoryNodeResponse,
    UserPsychometricsResponse,
    SleepConsolidationResponse,
)
from app.services.sleep_consolidation import SleepConsolidationService

router = APIRouter(tags=["memories"])


@router.get("/persona/{persona_id}", response_model=Dict[str, Any])
async def get_persona_memories(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Retrieve all facts and memories the AI companion has formed about the user."""
    user_id = current_user.id
    facts_query = select(UserFact).where(UserFact.persona_id == persona_id)
    mems_query = select(EpisodicMemory).where(EpisodicMemory.persona_id == persona_id)
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
    current_user: User = Depends(get_current_or_demo_user)
):
    """Retrieve facts formed for a persona."""
    user_id = current_user.id
    query = select(UserFact).where(UserFact.persona_id == persona_id)
    query = query.where(UserFact.user_id == user_id)
    query = query.order_by(desc(UserFact.updated_at))
    res = await db.execute(query)
    return res.scalars().all()


@router.get("/episodic", response_model=List[EpisodicMemoryResponse])
async def get_episodic_memories(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Retrieve episodic memories formed for a persona."""
    user_id = current_user.id
    query = select(EpisodicMemory).where(EpisodicMemory.persona_id == persona_id)
    query = query.where(EpisodicMemory.user_id == user_id)
    query = query.order_by(desc(EpisodicMemory.created_at))
    res = await db.execute(query)
    return res.scalars().all()


@router.post("/facts", response_model=UserFactResponse, status_code=status.HTTP_201_CREATED)
async def create_user_fact(
    persona_id: str,
    req: UserFactCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
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
    current_user: User = Depends(get_current_or_demo_user)
):
    """Delete a fact from memory."""
    query = select(UserFact).where(UserFact.id == fact_id)
    query = query.where(UserFact.user_id == current_user.id)
    res = await db.execute(query)
    fact = res.scalar_one_or_none()
    if not fact:
        raise HTTPException(status_code=404, detail="Fact not found")
    await db.delete(fact)
    await db.commit()


@router.post("/sleep-consolidation", response_model=SleepConsolidationResponse)
async def trigger_sleep_consolidation(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """
    Triggers deep cognitive sleep consolidation for a companion:
    resolves memory contradictions, updates temporal validity windows,
    and refines deduced user psychometrics (attachment style & love languages).
    """
    result = await SleepConsolidationService.run_consolidation(
        db=db,
        user_id=current_user.id,
        persona_id=persona_id
    )
    return result


@router.get("/temporal-graph/{persona_id}", response_model=List[TemporalMemoryNodeResponse])
async def get_temporal_graph(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Retrieves all temporal knowledge graph entities and validity windows for a persona."""
    user_id = current_user.id
    query = select(TemporalMemoryNode).where(TemporalMemoryNode.persona_id == persona_id)
    query = query.where(TemporalMemoryNode.user_id == user_id)
    query = query.order_by(desc(TemporalMemoryNode.valid_from))

    res = await db.execute(query)
    nodes = res.scalars().all()

    # If empty, run quick consolidation to seed initial rich graph
    if not nodes:
        await SleepConsolidationService.run_consolidation(db, user_id, persona_id)
        res = await db.execute(query)
        nodes = res.scalars().all()

    return nodes


@router.get("/psychometrics/{persona_id}", response_model=UserPsychometricsResponse)
async def get_user_psychometrics(
    persona_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_or_demo_user)
):
    """Retrieves deduced user psychometrics, attachment styles, and Big Five insights."""
    user_id = current_user.id
    query = select(UserPsychometrics).where(UserPsychometrics.persona_id == persona_id)
    query = query.where(UserPsychometrics.user_id == user_id)

    res = await db.execute(query)
    psych = res.scalar_one_or_none()

    if not psych:
        await SleepConsolidationService.run_consolidation(db, user_id, persona_id)
        res = await db.execute(query)
        psych = res.scalar_one_or_none()

    if not psych:
        raise HTTPException(status_code=404, detail="Psychometrics not found yet")

    return psych
