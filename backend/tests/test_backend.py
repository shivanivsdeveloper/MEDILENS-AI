import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.database import engine, Base, SessionLocal
from backend.app.services.seed_service import SeedService
from backend.app.ml.preprocessing.quality_engine import ImageQualityEngine
from backend.app.ml.modality_detector import ModalityDetector
from backend.app.ml.uncertainty.uncertainty_engine import UncertaintyEngine
from backend.app.ml.risk.risk_engine import RiskEngine

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        SeedService.seed_initial_data(db)
    finally:
        db.close()

def test_root_endpoint():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["platform"] == "MediScan AI"
        assert "safety_notice" in data

def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Healthy"
        assert "storage" in data
        assert "database_status" in data

def test_analytics_dashboard():
    with TestClient(app) as client:
        response = client.get("/api/analytics/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "total_scans" in data
        assert "risk_distribution" in data
        assert "modality_breakdown" in data

def test_list_scans():
    with TestClient(app) as client:
        response = client.get("/api/scans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

def test_list_models():
    with TestClient(app) as client:
        response = client.get("/api/models")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 5
        mod_names = [m["modality"] for m in data]
        assert "Chest X-ray" in mod_names
        assert "Retinal Fundus" in mod_names

def test_uncertainty_calculation():
    conf, uncert, entropy, meta = UncertaintyEngine.calculate_uncertainty([0.90, 0.05, 0.03, 0.02])
    assert conf > 0.70
    assert uncert < 0.40

    conf_amb, uncert_amb, entropy_amb, _ = UncertaintyEngine.calculate_uncertainty([0.25, 0.25, 0.25, 0.25])
    assert uncert_amb > uncert

def test_risk_engine_logic():
    risk, _ = RiskEngine.evaluate_risk(
        predicted_label="Normal",
        probability=0.92,
        confidence_score=0.88,
        uncertainty_score=0.15,
        quality_score=90.0,
        is_ood=False
    )
    assert risk == "Low"

    risk_abn, _ = RiskEngine.evaluate_risk(
        predicted_label="Pneumonia",
        probability=0.88,
        confidence_score=0.82,
        uncertainty_score=0.20,
        quality_score=85.0,
        is_ood=False
    )
    assert risk_abn == "High"

    risk_ood, _ = RiskEngine.evaluate_risk(
        predicted_label="Normal",
        probability=0.90,
        confidence_score=0.85,
        uncertainty_score=0.15,
        quality_score=90.0,
        is_ood=True
    )
    assert risk_ood == "Needs Review"
