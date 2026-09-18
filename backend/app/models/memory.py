import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class EpisodicMemory(Base):
    __tablename__ = "episodic_memories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    summary = Column(Text, nullable=False)
    emotional_significance = Column(Integer, default=5)  # 1 (casual) to 10 (life-altering / profound bond)
    # Stored as JSON array of floats for universal driver compatibility
    embedding = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="memories")
    persona = relationship("Persona", back_populates="memories")


class UserFact(Base):
    __tablename__ = "user_facts"
    __table_args__ = (UniqueConstraint("user_id", "persona_id", "category", "key", name="uq_user_persona_fact"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # 'preferences', 'relationship', 'work', 'habits', 'secret', 'pet'
    key = Column(String(100), nullable=False)
    value = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="facts")
    persona = relationship("Persona", back_populates="facts")


class ScheduledPing(Base):
    __tablename__ = "scheduled_pings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    scheduled_for = Column(DateTime(timezone=True), nullable=False)
    trigger_reason = Column(Text, nullable=False)  # "User had interview at 2pm", "Morning wake-up greeting"
    is_executed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
