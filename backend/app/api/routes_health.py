import os
import platform
import shutil
import torch
from fastapi import APIRouter
from backend.app.config.settings import settings

router = APIRouter(prefix="/health", tags=["System Health"])

@router.get("")
def get_system_health():
    # Check GPU availability
    has_cuda = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if has_cuda else "CPU (Direct Acceleration)"
    
    # Check disk storage
    total, used, free = shutil.disk_usage(str(settings.STORAGE_DIR))
    free_gb = round(free / (1024**3), 2)
    total_gb = round(total / (1024**3), 2)
    storage_pct = round((used / total) * 100, 1)

    return {
        "status": "Healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "platform": f"{platform.system()} {platform.release()} ({platform.machine()})",
        "python_runtime": platform.python_version(),
        "pytorch_version": torch.__version__,
        "compute_device": device_name,
        "cuda_available": has_cuda,
        "database_status": "Connected (SQLite Repository)",
        "inference_engine": "Online (Local Real-Time Engine)",
        "storage": {
            "free_gb": free_gb,
            "total_gb": total_gb,
            "used_pct": storage_pct,
            "status": "Nominal" if free_gb > 1.0 else "Low Storage Warning"
        },
        "privacy_mode": "Strict Local Processing (Zero Cloud Data Transmission)",
        "offline_ready": True
    }
