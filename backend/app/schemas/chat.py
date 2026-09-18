from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, ConfigDict


class SendMessageRequest(BaseModel):
    persona_id: str
    conversation_id: Optional[str] = None
    content: str = Field(..., min_length=1)
    media_type: Optional[str] = "text"  # 'text', 'voice_note'


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


class ConversationResponse(BaseModel):
    id: str
    persona_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    last_message: Optional[MessageResponse] = None

    model_config = ConfigDict(from_attributes=True)


class AgentStreamEvent(BaseModel):
    type: str  # 'thought', 'token', 'media', 'mood_update', 'done', 'error'
    content: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
