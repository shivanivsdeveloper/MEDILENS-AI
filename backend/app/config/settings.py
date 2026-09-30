import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
STORAGE_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"
OUTPUTS_DIR = BASE_DIR / "outputs"

class Settings(BaseSettings):
    PROJECT_NAME: str = "MediScan AI"
    VERSION: str = "2.5.0"
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # Paths
    BASE_DIR: Path = BASE_DIR
    STORAGE_DIR: Path = STORAGE_DIR
    UPLOAD_DIR: Path = STORAGE_DIR / "raw"
    PROCESSED_DIR: Path = STORAGE_DIR / "processed"
    SAMPLE_DIR: Path = STORAGE_DIR / "sample"
    MODELS_DIR: Path = MODELS_DIR
    CHECKPOINTS_DIR: Path = MODELS_DIR / "checkpoints"
    REPORTS_DIR: Path = REPORTS_DIR
    OUTPUTS_DIR: Path = OUTPUTS_DIR
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/mediscan.db")
    
    # Upload limits
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list[str] = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".dcm"]
    
    # Risk Engine Thresholds (Deterministic & Explainable)
    RISK_HIGH_THRESHOLD: float = 0.70
    RISK_MODERATE_THRESHOLD: float = 0.40
    UNCERTAINTY_HIGH_THRESHOLD: float = 0.35
    QUALITY_MIN_ACCEPTABLE: int = 40
    
    # Security & CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*"
    ]
    
    # Localization
    DEFAULT_LANGUAGE: str = "en"
    SUPPORTED_LANGUAGES: list[str] = ["en", "ta"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure directories exist
for p in [settings.UPLOAD_DIR, settings.PROCESSED_DIR, settings.SAMPLE_DIR, 
          settings.CHECKPOINTS_DIR, settings.REPORTS_DIR, settings.OUTPUTS_DIR]:
    p.mkdir(parents=True, exist_ok=True)
