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
