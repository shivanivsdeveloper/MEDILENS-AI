import os
from fastapi import APIRouter
from backend.app.config.settings import settings

router = APIRouter(prefix="/health", tags=["System Health"])

@router.get("")
def get_system_health():
    return {
        "status": "Healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database_status": "Connected",
        "storage": {
            "status": "Nominal",
            "free_gb": 10.0
        }
    }
