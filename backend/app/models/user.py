import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=False)
    timezone = Column(String(50), default="UTC")
    push_token = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Subscription and Monetization Tier
    subscription_tier = Column(String(50), default="free")  # 'free', 'plus', 'vip'
    subscription_status = Column(String(50), default="active")  # 'active', 'canceled', 'past_due'
    stripe_customer_id = Column(String(100), nullable=True)

    # Usage Quotas Tracking
    messages_today = Column(Integer, default=0)
    voice_seconds_used = Column(Integer, default=0)
    photos_generated_count = Column(Integer, default=0)

    # Relationships
    personas = relationship("Persona", back_populates="creator", cascade="all, delete-orphan")
    relationships = relationship("RelationshipState", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    memories = relationship("EpisodicMemory", back_populates="user", cascade="all, delete-orphan")
    facts = relationship("UserFact", back_populates="user", cascade="all, delete-orphan")
