"""
Database Engine and Async Session Management.
Supports both async SQLite (default local zero-config) and async PostgreSQL with pgvector.
"""
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

is_sqlite = "sqlite" in settings.DATABASE_URL

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=not is_sqlite,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for yielding an async database session per request."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Create registered model tables. Startup seeds companions separately."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
