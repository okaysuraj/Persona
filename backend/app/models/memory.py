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


class TemporalMemoryNode(Base):
    __tablename__ = "temporal_memory_nodes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(100), nullable=False, default="User")
    predicate = Column(String(100), nullable=False)
    object = Column(Text, nullable=False)
    emotional_context = Column(Text, nullable=True)
    valid_from = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    valid_until = Column(DateTime(timezone=True), nullable=True)
    is_current = Column(Boolean, default=True)
    causal_relation = Column(Text, nullable=True)
    confidence = Column(Float, default=0.95)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserPsychometrics(Base):
    __tablename__ = "user_psychometrics"
    __table_args__ = (UniqueConstraint("user_id", "persona_id", name="uq_user_persona_psychometrics"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)
    attachment_style = Column(String(50), default="secure")
    attachment_score = Column(Float, default=0.85)
    love_language = Column(String(50), default="words_of_affirmation")
    big_five = Column(JSON, default=lambda: {
        "openness": 0.82,
        "conscientiousness": 0.74,
        "extraversion": 0.52,
        "agreeableness": 0.88,
        "neuroticism": 0.38
    })
    growth_edges = Column(JSON, default=lambda: [
        "Needs gentle permission to rest without guilt",
        "Thrives when heard without immediate unsolicited problem-solving"
    ])
    coping_preferences = Column(JSON, default=lambda: [
        "Unhurried breathing",
        "Quiet evening sensory decompression",
        "Tea ritual"
    ])
    last_consolidated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
