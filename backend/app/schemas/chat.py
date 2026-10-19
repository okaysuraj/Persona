from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class UserContextPayload(BaseModel):
    local_time: Optional[str] = None
    steps_today: Optional[int] = None
    sleep_hours: Optional[float] = None
    heart_rate_bpm: Optional[int] = None
    weather_condition: Optional[str] = None
    fatigue_level: Optional[str] = None  # 'rested', 'moderate', 'exhausted'


class SendMessageRequest(BaseModel):
    persona_id: str
    conversation_id: Optional[str] = None
    content: str = Field(..., min_length=1)
    media_type: Optional[str] = "text"  # 'text', 'voice_note', 'image'
    user_context: Optional[UserContextPayload] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_type: str
    content: str
    thought_trace: Optional[str] = None
    media_type: str
    media_url: Optional[str] = None
    metadata_json: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VisionInspectRequest(BaseModel):
    persona_id: str
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    user_question: Optional[str] = "What do you think of this?"
    user_context: Optional[UserContextPayload] = None


class LoungeTurnRequest(BaseModel):
    persona_ids: List[str] = Field(..., min_length=2)
    content: str = Field(..., min_length=1)
    theme: Optional[str] = "fireside evening parlor"


class LoungePersonaTurn(BaseModel):
    persona_id: str
    persona_name: str
    avatar_url: str
    archetype: str
    content: str
    thought_trace: Optional[str] = None


class LoungeTurnResponse(BaseModel):
    user_message: str
    theme: str
    turns: List[LoungePersonaTurn]
    group_harmony_xp: int = 25
