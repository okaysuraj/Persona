import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Persona(Base):
    __tablename__ = "personas"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # Null = default system persona
    name = Column(String(100), nullable=False)
    gender = Column(String(50), nullable=False)
    archetype = Column(String(50), nullable=False)  # 'girlfriend', 'boyfriend', 'mentor', 'tsundere', etc.
    tagline = Column(String(255), nullable=True)
    system_prompt = Column(Text, nullable=False)
    backstory = Column(Text, nullable=False)
    avatar_url = Column(String(500), nullable=False)
    voice_id = Column(String(100), default="default_female_warm")
    speech_style = Column(JSON, default=dict)  # {"cadence": "playful", "emoji_level": "medium", "pet_names": ["babe", "sweetheart"]}
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    creator = relationship("User", back_populates="personas")
    relationships = relationship("RelationshipState", back_populates="persona", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="persona", cascade="all, delete-orphan")
    memories = relationship("EpisodicMemory", back_populates="persona", cascade="all, delete-orphan")
    facts = relationship("UserFact", back_populates="persona", cascade="all, delete-orphan")
