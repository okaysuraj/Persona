import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


class RelationshipState(Base):
    __tablename__ = "relationship_states"
    __table_args__ = (UniqueConstraint("user_id", "persona_id", name="uq_user_persona_relationship"),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    persona_id = Column(String(36), ForeignKey("personas.id", ondelete="CASCADE"), nullable=False)

    # Dynamics
    intimacy_level = Column(Integer, default=1)  # 1 to 100
    intimacy_xp = Column(Integer, default=0)    # Points towards next level
    stage = Column(String(50), default="acquaintance")  # 'acquaintance', 'friend', 'close_friend', 'confidant', 'romantic'

    # Emotional State Vector
    # E.g. {"joy": 0.8, "empathy": 0.9, "flirt": 0.2, "energy": 0.7, "vulnerability": 0.3}
    mood_state = Column(JSON, default=lambda: {
        "joy": 0.8,
        "empathy": 0.85,
        "flirt": 0.3,
        "energy": 0.75,
        "vulnerability": 0.3
    })

    last_interaction_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="relationships")
    persona = relationship("Persona", back_populates="relationships")
