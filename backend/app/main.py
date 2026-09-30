import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
project_root = Path(__file__).resolve().parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from backend.app.config.settings import settings
from backend.app.models.database import engine, Base, SessionLocal
from backend.app.services.seed_service import SeedService
from backend.app.services.auth_service import AuthService

# Import routers
from backend.app.api.routes_health import router as health_router
from backend.app.api.routes_scans import router as scans_router
from backend.app.api.routes_patients import router as patients_router
from backend.app.api.routes_reviews import router as reviews_router
from backend.app.api.routes_models import router as models_router
from backend.app.api.routes_experiments import router as experiments_router
from backend.app.api.routes_analytics import router as analytics_router
from backend.app.api.routes_audit import router as audit_router
from backend.app.api.routes_research import router as research_router
from backend.app.api.routes_lab import router as lab_router
from backend.app.api.routes_annotations import router as annotations_router
from backend.app.api.routes_drift import router as drift_router
from backend.app.api.routes_auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed initial data
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        SeedService.seed_initial_data(db)
        AuthService.seed_default_users(db)
    except Exception as e:
        print(f"[Warning] Seed data initialization: {e}")
    finally:
        db.close()
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="MediScan AI — Production-Level Medical AI Screening & Explainability Workstation API",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Directories for images, heatmaps, reports
app.mount("/static/raw", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="raw")
app.mount("/static/sample", StaticFiles(directory=str(settings.SAMPLE_DIR)), name="sample")
app.mount("/static/outputs", StaticFiles(directory=str(settings.OUTPUTS_DIR)), name="outputs")
app.mount("/static/reports", StaticFiles(directory=str(settings.REPORTS_DIR)), name="reports")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(scans_router, prefix=settings.API_V1_PREFIX)
app.include_router(patients_router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews_router, prefix=settings.API_V1_PREFIX)
app.include_router(models_router, prefix=settings.API_V1_PREFIX)
app.include_router(experiments_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_router, prefix=settings.API_V1_PREFIX)
app.include_router(research_router, prefix=settings.API_V1_PREFIX)
app.include_router(lab_router, prefix=settings.API_V1_PREFIX)
app.include_router(annotations_router, prefix=settings.API_V1_PREFIX)
app.include_router(drift_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Operational",
        "docs_url": "/docs",
        "health_url": "/health",
        "safety_notice": "AI screening decision-support system. Not a definitive medical diagnosis."
    }

@app.get("/health", tags=["System Health"])
def health_check():
    import platform
    return {
        "status": "Healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "platform": f"{platform.system()} {platform.release()} ({platform.machine()})",
        "compute_device": "CPU (Low-Memory Engine)",
        "database_status": "Connected",
        "inference_engine": "Online (Lazy Loading)"
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=settings.DEBUG)
