"""
Application Configuration and Settings.
Supports dynamic environment loading, database configuration, and AI API keys.
"""
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Project metadata
    PROJECT_NAME: str = "Persona AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "persona-super-secret-jwt-signing-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8081",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8081",
    ]

    # Database: Defaults to local zero-config SQLite async, or PostgreSQL if specified in .env
    DATABASE_URL: str = "sqlite+aiosqlite:///./persona.db"

    # AI Model Providers (fallback to mock persona engine if unconfigured)
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = None
    CARTESIA_API_KEY: Optional[str] = None
    FAL_KEY: Optional[str] = None

    # Observability & Tracing (Langfuse)
    LANGFUSE_PUBLIC_KEY: Optional[str] = None
    LANGFUSE_SECRET_KEY: Optional[str] = None
    LANGFUSE_HOST: str = "https://cloud.langfuse.com"

    # Payments & Monetization (Stripe)
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_PRICE_ID_PLUS: Optional[str] = None
    STRIPE_PRICE_ID_VIP: Optional[str] = None

    # Agent Engine Defaults
    DEFAULT_LLM_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"


settings = Settings()
