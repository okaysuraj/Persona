from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.personas import router as personas_router
from app.api.v1.chat import router as chat_router
from app.api.v1.memories import router as memories_router
from app.api.v1.voice import router as voice_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(personas_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(memories_router)
api_v1_router.include_router(voice_router)
