from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.jobs import router as jobs_router
from app.api.materials import router as materials_router
from app.api.parts import router as parts_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(materials_router)
api_router.include_router(parts_router)
api_router.include_router(jobs_router)
