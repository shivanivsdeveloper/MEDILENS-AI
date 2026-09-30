import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

def test_lab_dashboard_stats():
    with TestClient(app) as client:
        response = client.get("/api/lab/dashboard-stats")
        assert response.status_code == 200
        data = response.json()
        assert "hardware_telemetry" in data
        assert "summary" in data
        assert "running_jobs" in data

def test_lab_training_flow():
    with TestClient(app) as client:
        # Start training job
        response = client.post("/api/lab/training/start", json={
            "name": "Test ResNet PyTest Run",
            "architecture": "ResNet-50",
            "dataset_name": "NIH-ChestXray14-Research-Split",
            "epochs": 3,
            "batch_size": 8,
            "learning_rate": 0.0003,
            "optimizer": "AdamW"
        })
        assert response.status_code == 200
        job_data = response.json()
        assert "job_id" in job_data
        job_id = job_data["job_id"]

        # Check job details
        detail_resp = client.get(f"/api/lab/training/jobs/{job_id}")
        assert detail_resp.status_code == 200
        assert detail_resp.json()["name"] == "Test ResNet PyTest Run"

def test_lab_calibration():
    with TestClient(app) as client:
        response = client.get("/api/lab/calibration")
        assert response.status_code == 200
        data = response.json()
        assert "ece" in data
        assert "reliability_bins" in data

def test_lab_pattern_discovery():
    with TestClient(app) as client:
        response = client.post("/api/lab/pattern-discovery/cluster", json={
            "method": "PCA",
            "n_clusters": 4
        })
        assert response.status_code == 200
        data = response.json()
        assert "projection_method" in data
        assert "nodes" in data

def test_lab_autopilot_suggestions():
    with TestClient(app) as client:
        response = client.get("/api/lab/autopilot/suggestions")
        assert response.status_code == 200
        data = response.json()
        assert "suggestions" in data
        assert len(data["suggestions"]) > 0

def test_lab_advanced_tools_status():
    with TestClient(app) as client:
        response = client.get("/api/lab/advanced-tools/status")
        assert response.status_code == 200
        data = response.json()
        assert "tools" in data
        assert len(data["tools"]) >= 10

def test_lab_evolution_timeline():
    with TestClient(app) as client:
        response = client.get("/api/lab/evolution-timeline")
        assert response.status_code == 200
        data = response.json()
        assert "timeline" in data
        assert len(data["timeline"]) > 0
