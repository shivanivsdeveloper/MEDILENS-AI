import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.database import engine, Base, SessionLocal
from backend.app.services.seed_service import SeedService
from backend.app.ml.agents.orchestrator import MultiAgentOrchestrator
from backend.app.ml.debate.consensus_engine import ModelCourtConsensusEngine
from backend.app.ml.safety.abstention_engine import AIAbstentionEngine
from backend.app.ml.embeddings.embedding_engine import EmbeddingUniverseEngine
from backend.app.ml.embeddings.similarity_search import SimilarCaseRetrievalEngine
from backend.app.ml.digital_twin.progression_simulator import DiseaseProgressionSimulator
from backend.app.ml.calibration.calibration_engine import CalibrationEngine
from backend.app.ml.dataset_intel.leakage_detector import DatasetLeakageDetector
from backend.app.ml.dataset_intel.health_scorer import DatasetHealthScorer

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        SeedService.seed_initial_data(db)
    finally:
        db.close()

def test_embedding_universe_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/research/embeddings")
        assert response.status_code == 200
        data = response.json()
        assert "nodes" in data
        assert "total_nodes" in data
        assert len(data["nodes"]) > 0
        node = data["nodes"][0]
        assert "coord_2d" in node
        assert "coord_3d" in node
        assert "cluster_label" in node

def test_similar_cases_endpoint():
    with TestClient(app) as client:
        # Get first available scan
        scans_res = client.get("/api/scans")
        scans = scans_res.json()
        if len(scans) > 0:
            scan_id = scans[0]["id"]
            response = client.get(f"/api/research/similar-cases/{scan_id}")
            assert response.status_code == 200
            data = response.json()
            assert "similar_cases" in data

def test_digital_twin_endpoint():
    with TestClient(app) as client:
        patients_res = client.get("/api/patients")
        patients = patients_res.json()
        if len(patients) > 0:
            p_id = patients[0]["id"]
            response = client.get(f"/api/research/digital-twin/{p_id}")
            assert response.status_code == 200
            data = response.json()
            assert "timeline" in data
            assert "total_visits" in data

def test_progression_simulator():
    sample_points = [
        {"scan_id": 1, "month_offset": 0, "lesion_area_pct": 5.2, "confidence": 0.90},
        {"scan_id": 2, "month_offset": 3, "lesion_area_pct": 7.8, "confidence": 0.88},
        {"scan_id": 3, "month_offset": 6, "lesion_area_pct": 10.4, "confidence": 0.86}
    ]
    res = DiseaseProgressionSimulator.simulate_trajectory(sample_points, forecast_horizon_months=12)
    assert res["status"] == "SIMULATION_COMPLETED"
    assert len(res["projected_trajectory"]) > 0
    assert "fitted_slope_pct_per_month" in res

def test_abstention_engine():
    # Nominal case
    res_pass = AIAbstentionEngine.evaluate_safety_and_abstention(
        quality_score=92.0,
        confidence_score=0.91,
        uncertainty_score=0.12,
        entropy=0.35,
        is_ood=False,
        ood_score=0.08
    )
    assert res_pass["should_abstain"] is False
    assert res_pass["ai_state"] == "NOMINAL_PASSED"

    # Severe degradation case
    res_abstain = AIAbstentionEngine.evaluate_safety_and_abstention(
        quality_score=32.0,
        confidence_score=0.45,
        uncertainty_score=0.68,
        entropy=2.10,
        is_ood=True,
        ood_score=0.88
    )
    assert res_abstain["should_abstain"] is True
    assert res_abstain["ai_state"] == "ABSTENTION_ENFORCED"

def test_calibration_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/lab/calibration")
        assert response.status_code == 200
        data = response.json()
        assert "ece" in data
        assert "reliability_bins" in data

def test_leakage_check_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/lab/leakage-check")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "patient_leakage_detected" in data

def test_dataset_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/lab/health-check")
        assert response.status_code == 200
        data = response.json()
        assert "health_score" in data
        assert "health_grade" in data

def test_annotations_workflow():
    with TestClient(app) as client:
        scans_res = client.get("/api/scans")
        scans = scans_res.json()
        if len(scans) > 0:
            scan_id = scans[0]["id"]
            
            # Create annotation
            payload = {
                "scan_id": scan_id,
                "author_name": "Dr. Vance",
                "annotation_type": "bounding_box",
                "label": "Consolidation ROI",
                "data_json": '{"x": 120, "y": 80, "width": 140, "height": 110}'
            }
            create_res = client.post("/api/annotations", json=payload)
            assert create_res.status_code == 200
            anno_id = create_res.json()["id"]

            # List annotations
            list_res = client.get(f"/api/annotations?scan_id={scan_id}")
            assert list_res.status_code == 200
            assert len(list_res.json()) > 0

            # Consensus endpoint
            cons_res = client.get(f"/api/annotations/consensus/{scan_id}")
            assert cons_res.status_code == 200
            assert "cohens_kappa" in cons_res.json()

def test_drift_status_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/drift/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "feature_drift_score" in data
