from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class PersonaCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    gender: str = Field(..., max_length=50)
    archetype: str = Field(..., max_length=50)  # e.g., 'girlfriend', 'boyfriend', 'confidant'
    tagline: Optional[str] = None
    system_prompt: str
    backstory: str
    avatar_url: str
    voice_id: Optional[str] = "default_female_warm"
    speech_style: Optional[Dict[str, Any]] = Field(default_factory=dict)
    is_public: Optional[bool] = True


class PersonaUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    system_prompt: Optional[str] = None
    backstory: Optional[str] = None
    avatar_url: Optional[str] = None
    voice_id: Optional[str] = None
    speech_style: Optional[Dict[str, Any]] = None


class PersonaResponse(BaseModel):
    id: str
    user_id: Optional[str]
    name: str
    gender: str
    archetype: str
    tagline: Optional[str]
    system_prompt: str
    backstory: str
    avatar_url: str
    voice_id: str
    speech_style: Dict[str, Any]
    is_public: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RelationshipResponse(BaseModel):
    persona_id: str
    intimacy_level: int
    intimacy_xp: int
    stage: str
    mood_state: Dict[str, float]
    last_interaction_at: datetime

    model_config = ConfigDict(from_attributes=True)
