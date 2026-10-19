from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserFactCreate(BaseModel):
    category: str = Field(..., max_length=50)
    key: str = Field(..., max_length=100)
    value: str
    confidence: Optional[float] = 1.0


class UserFactResponse(BaseModel):
    id: str
    persona_id: str
    category: str
    key: str
    value: str
    confidence: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EpisodicMemoryResponse(BaseModel):
    id: str
    persona_id: str
    summary: str
    emotional_significance: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TemporalMemoryNodeCreate(BaseModel):
    subject: str = "User"
    predicate: str
    object: str
    emotional_context: Optional[str] = None
    is_current: bool = True
    causal_relation: Optional[str] = None
    confidence: Optional[float] = 0.95


class TemporalMemoryNodeResponse(BaseModel):
    id: str
    persona_id: str
    subject: str
    predicate: str
    object: str
    emotional_context: Optional[str] = None
    valid_from: datetime
    valid_until: Optional[datetime] = None
    is_current: bool
    causal_relation: Optional[str] = None
    confidence: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserPsychometricsResponse(BaseModel):
    id: str
    persona_id: str
    attachment_style: str
    attachment_score: float
    love_language: str
    big_five: dict
    growth_edges: list
    coping_preferences: list
    last_consolidated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SleepConsolidationResponse(BaseModel):
    persona_id: str
    status: str
    milestones_consolidated: int
    contradictions_resolved: int
    temporal_nodes_added: int
    psychometrics_updated: bool
    insights_summary: str
