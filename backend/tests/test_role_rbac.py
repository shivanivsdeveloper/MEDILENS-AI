import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.models.database import engine, Base, SessionLocal
from backend.app.models.entities import User, Scan
from backend.app.services.seed_service import SeedService

@pytest.fixture(scope="module", autouse=True)
def setup_rbac_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        SeedService.seed_initial_data(db)
    finally:
        db.close()

def test_role_login_doctor():
    with TestClient(app) as client:
        # Successful doctor login
        res = client.post("/api/auth/login", json={"username": "dr.sharma", "password": "DoctorPass123!"})
        assert res.status_code == 200
        data = res.json()
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "Doctor"
        assert data["user"]["is_verified"] is True
        token = data["access_token"]

        # Profile /me verification
        me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_res.status_code == 200
        assert me_res.json()["username"] == "dr.sharma"

def test_role_login_patient():
    with TestClient(app) as client:
        res = client.post("/api/auth/login", json={"username": "patient.john", "password": "PatientPass123!"})
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["role"] == "Patient"

def test_role_login_scan_center():
    with TestClient(app) as client:
        res = client.post("/api/auth/login", json={"username": "metro.imaging", "password": "ScanCenterPass123!"})
        assert res.status_code == 200
        data = res.json()
        assert data["user"]["role"] == "ScanCenter"

def test_role_login_invalid_password():
    with TestClient(app) as client:
        res = client.post("/api/auth/login", json={"username": "dr.sharma", "password": "WrongPassword!"})
        assert res.status_code == 401

def test_patient_signup_and_isolation():
    with TestClient(app) as client:
        uid = uuid.uuid4().hex[:6]
        username = f"patient.ananya_{uid}"
        email = f"ananya_{uid}@example.com"
        
        # Register new patient
        signup_res = client.post("/api/auth/signup/patient", json={
            "username": username,
            "email": email,
            "password": "SecurePatient99!",
            "full_name": "Ananya Iyer",
            "age": 34,
            "gender": "Female",
            "preferred_language": "ta",
            "consent_agreed": True
        })
        assert signup_res.status_code == 200

        # Login as new patient
        login_res = client.post("/api/auth/login", json={"username": username, "password": "SecurePatient99!"})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]

        # Check patient my-scans
        scans_res = client.get("/api/auth/patient/my-scans", headers={"Authorization": f"Bearer {token}"})
        assert scans_res.status_code == 200
        assert isinstance(scans_res.json(), list)

def test_doctor_worklist_and_blinded_opinion():
    with TestClient(app) as client:
        # Login as doctor
        login_res = client.post("/api/auth/login", json={"username": "dr.sharma", "password": "DoctorPass123!"})
        token = login_res.json()["access_token"]

        # Get worklist
        wl_res = client.get("/api/auth/doctor/worklist", headers={"Authorization": f"Bearer {token}"})
        assert wl_res.status_code == 200
        worklist = wl_res.json()
        assert len(worklist) > 0
        first_scan = worklist[0]

        # Record blinded second opinion
        imp_res = client.post(
            f"/api/auth/doctor/impressions/{first_scan['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"impression": "Normal lung parenchyma with clear costophrenic angles."}
        )
        assert imp_res.status_code == 200
        imp_data = imp_res.json()
        assert imp_data["ai_revealed"] is True
        assert "agreement_assessment" in imp_data

        # Sign and release report to patient
        sign_res = client.post(
            f"/api/auth/doctor/sign-report/{first_scan['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "final_decision": "Accepted",
                "clinical_notes": "No acute consolidation. Normal chest radiograph.",
                "release_to_patient": True
            }
        )
        assert sign_res.status_code == 200
        assert sign_res.json()["is_released_to_patient"] is True

def test_scan_center_workload_and_routing():
    with TestClient(app) as client:
        login_res = client.post("/api/auth/login", json={"username": "metro.imaging", "password": "ScanCenterPass123!"})
        token = login_res.json()["access_token"]

        wl_res = client.get("/api/auth/scan-center/workload", headers={"Authorization": f"Bearer {token}"})
        assert wl_res.status_code == 200
        data = wl_res.json()
        assert "today_intake" in data
        assert "available_doctors" in data
        assert len(data["available_doctors"]) > 0

def test_admin_approvals_and_security_barriers():
    with TestClient(app) as client:
        uid = uuid.uuid4().hex[:6]
        username = f"dr.verma_{uid}"
        email = f"dr.verma_{uid}@apexradiology.org"

        # 1. Register a doctor requiring admin verification
        doc_signup = client.post("/api/auth/signup/doctor", json={
            "username": username,
            "email": email,
            "password": "DoctorPass456!",
            "full_name": "Dr. Sneha Verma",
            "specialty": "Neuroradiologist",
            "registration_number": "MCI-2021-99412",
            "hospital": "Apex Neuro Institute"
        })
        assert doc_signup.status_code == 200
        assert doc_signup.json()["verification_status"] == "Pending"

        # 2. Patient attempting to access admin endpoints must receive 403 Forbidden
        patient_login = client.post("/api/auth/login", json={"username": "patient.john", "password": "PatientPass123!"})
        p_token = patient_login.json()["access_token"]
        blocked_res = client.get("/api/auth/admin/pending-approvals", headers={"Authorization": f"Bearer {p_token}"})
        assert blocked_res.status_code == 403

        # 3. Admin login and approve doctor
        admin_login = client.post("/api/auth/login", json={"username": "admin.gov", "password": "AdminPass123!"})
        a_token = admin_login.json()["access_token"]

        pending_res = client.get("/api/auth/admin/pending-approvals", headers={"Authorization": f"Bearer {a_token}"})
        assert pending_res.status_code == 200
        pending_list = pending_res.json()
        target = next((u for u in pending_list if u["username"] == username), None)
        assert target is not None

        # Approve target doctor
        approve_res = client.post(
            f"/api/auth/admin/approvals/{target['user_id']}/decision",
            headers={"Authorization": f"Bearer {a_token}"},
            json={"decision": "Approved"}
        )
        assert approve_res.status_code == 200
        assert approve_res.json()["new_status"] == "Approved"
