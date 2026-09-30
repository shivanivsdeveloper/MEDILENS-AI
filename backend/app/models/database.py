import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.config.settings import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def run_safe_migrations():
    """
    Performs safe, additive SQLite migrations for new role-based fields without dropping any existing tables or rows.
    """
    with engine.connect() as conn:
        migration_statements = [
            "ALTER TABLE scans ADD COLUMN scan_center_id INTEGER",
            "ALTER TABLE scans ADD COLUMN assigned_doctor_id INTEGER",
            "ALTER TABLE scans ADD COLUMN workflow_stage VARCHAR(50) DEFAULT 'DoctorReviewing'",
            "ALTER TABLE scans ADD COLUMN is_released_to_patient BOOLEAN DEFAULT 0",
            "ALTER TABLE scans ADD COLUMN doctor_approved_report TEXT",
            "ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 1",
            "ALTER TABLE users ADD COLUMN verification_status VARCHAR(50) DEFAULT 'Approved'",
            "ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN locked_until DATETIME",
            "ALTER TABLE users ADD COLUMN last_login DATETIME"
        ]
        for stmt in migration_statements:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                # Column already exists or table not yet created
                pass

# Run safe additive migrations immediately
run_safe_migrations()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
