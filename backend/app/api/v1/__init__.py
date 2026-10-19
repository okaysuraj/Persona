from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.personas import router as personas_router
from app.api.v1.chat import router as chat_router
from app.api.v1.memories import router as memories_router
from app.api.v1.voice import router as voice_router
from app.api.v1.billing import router as billing_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.letters import router as letters_router
from app.api.v1.activities import router as activities_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(personas_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(memories_router, prefix="/memories")
# Compatibility with clients that used the singular memory path.
api_v1_router.include_router(memories_router, prefix="/memory", include_in_schema=False)
api_v1_router.include_router(voice_router)
api_v1_router.include_router(billing_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(letters_router)
api_v1_router.include_router(activities_router)
