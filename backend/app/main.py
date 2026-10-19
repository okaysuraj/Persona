"""
FastAPI Main Application Entrypoint.
Initializes database, default companions, CORS, routers, and background scheduler.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.bootstrap import seed_default_personas, seed_default_user
from app.api.v1 import api_v1_router
from app.workers.proactive_daemon import start_proactive_scheduler, stop_proactive_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await seed_default_personas()
    await seed_default_user()
    start_proactive_scheduler()
    try:
        yield
    finally:
        stop_proactive_scheduler()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agent-First AI Personal Companion Platform API",
    lifespan=lifespan
)

# Secure CORS configuration supporting web clients and mobile LAN dev clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|.*\.exp\.direct)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix=settings.API_V1_STR)
# Older clients share the same handlers; documentation uses the versioned API.
app.include_router(api_v1_router, prefix="/api", include_in_schema=False)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
