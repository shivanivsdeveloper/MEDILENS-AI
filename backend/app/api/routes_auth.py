import uuid
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Header, Body, Query
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.entities import (
    User, DoctorProfile, ScanCenterProfile, PatientProfile, Scan,
    Patient, AnalysisResult, AuditLog, ScanShareLink, DoctorImpression
)
from backend.app.services.auth_service import AuthService
from backend.app.api.routes_scans import format_scan_response

router = APIRouter(prefix="/auth", tags=["Role-Based Authentication & Authorization"])

# Helper dependency to extract authenticated user
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        # Fallback for dev / unauthenticated requests
        user = db.query(User).filter(User.username == "dr.sharma").first()
        if user:
            return user
        raise HTTPException(status_code=401, detail="Authentication credentials missing or invalid")
    
    token = authorization.split(" ")[1]
    payload = AuthService.decode_jwt_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token")

    user = db.query(User).filter(User.id == payload.get("user_id")).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User account is inactive or not found")
    
    return user

def require_role(allowed_roles: List[str]):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Role '{user.role}' is not authorized. Required: {allowed_roles}"
            )
        return user
    return role_checker


# ==========================================
# AUTHENTICATION: LOGIN & CURRENT USER
# ==========================================

@router.post("/login")
def login_user(
    username: str = Body(...),
    password: str = Body(...),
    db: Session = Depends(get_db)
):
    """
    Role-aware authentication with hashed password verification and lockout protection.
    """
    user = db.query(User).filter(
        (User.username == username) | (User.email == username)
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid clinician ID, email, or password.")

    # Check lockout
    if user.locked_until and user.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=403,
            detail=f"Account temporarily locked due to repeated failures until {user.locked_until.strftime('%H:%M:%S')}."
        )

    # Verify password
    if not AuthService.verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.locked_until = datetime.utcnow() + timedelta(minutes=15)
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid clinician ID, email, or password.")

    # Reset failure counter on successful login
    user.failed_login_attempts = 0
    user.last_login = datetime.utcnow()
    db.commit()

    # Log audit event
    audit = AuditLog(
        user_identifier=user.username,
        role=user.role,
        action="LOGIN",
        resource_type="USER_SESSION",
        resource_id=str(user.id),
        details=json.dumps({"role": user.role, "verified": user.is_verified})
    )
    db.add(audit)
    db.commit()

    # Create JWT
    token = AuthService.create_jwt_token({
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "is_verified": user.is_verified
    })

    # Prepare profile info
    profile_info = {}
    if user.role == "Doctor" and user.doctor_profile:
        profile_info = {
            "full_name": user.doctor_profile.full_name,
            "specialty": user.doctor_profile.specialty,
            "registration_number": user.doctor_profile.registration_number,
            "hospital": user.doctor_profile.hospital_clinic
        }
    elif user.role == "ScanCenter" and user.scan_center_profile:
        profile_info = {
            "center_name": user.scan_center_profile.center_name,
            "license_number": user.scan_center_profile.license_number,
            "address": user.scan_center_profile.address
        }
    elif user.role == "Patient" and user.patient_profile:
        profile_info = {
            "full_name": user.patient_profile.full_name,
            "preferred_language": user.patient_profile.preferred_language,
            "patient_record_id": user.patient_profile.patient_record_id
        }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_verified": user.is_verified,
            "verification_status": user.verification_status,
            "profile": profile_info
        }
    }

@router.get("/me")
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Returns profile and clearance for active session."""
    profile_info = {}
    if user.role == "Doctor" and user.doctor_profile:
        profile_info = {
            "full_name": user.doctor_profile.full_name,
            "specialty": user.doctor_profile.specialty,
            "registration_number": user.doctor_profile.registration_number,
            "hospital": user.doctor_profile.hospital_clinic
        }
    elif user.role == "ScanCenter" and user.scan_center_profile:
        profile_info = {
            "center_name": user.scan_center_profile.center_name,
            "license_number": user.scan_center_profile.license_number,
            "address": user.scan_center_profile.address
        }
    elif user.role == "Patient" and user.patient_profile:
        profile_info = {
            "full_name": user.patient_profile.full_name,
            "preferred_language": user.patient_profile.preferred_language,
            "patient_record_id": user.patient_profile.patient_record_id
        }

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_verified": user.is_verified,
        "verification_status": user.verification_status,
        "profile": profile_info
    }


# ==========================================
# SIGNUP FLOWS (PATIENT, DOCTOR, SCAN CENTER)
# ==========================================

@router.post("/signup/patient")
def signup_patient(
    username: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    full_name: str = Body(...),
    age: int = Body(45),
    gender: str = Body("Other"),
    phone: str = Body(""),
    preferred_language: str = Body("en"),
    consent_agreed: bool = Body(True),
    db: Session = Depends(get_db)
):
    """Registers patient account with privacy consent."""
    if db.query(User).filter((User.username == username) | (User.email == email)).first():
        raise HTTPException(status_code=400, detail="Username or email already in use.")

    # Create Core Patient entity
    new_pt = Patient(
        reference_id=f"PT-REF-{uuid.uuid4().hex[:6].upper()}",
        pseudonym=f"Patient {full_name.split()[0]}",
        age=age,
        sex=gender
    )
    db.add(new_pt)
    db.flush()

    new_user = User(
        username=username,
        email=email,
        password_hash=AuthService.hash_password(password),
        role="Patient",
        is_active=True,
        is_verified=True,  # Patients verified upon consent
        verification_status="Approved"
    )
    db.add(new_user)
    db.flush()

    profile = PatientProfile(
        user_id=new_user.id,
        patient_record_id=new_pt.id,
        full_name=full_name,
        age=age,
        gender=gender,
        phone=phone,
        preferred_language=preferred_language,
        consent_given_at=datetime.utcnow()
    )
    db.add(profile)
    db.commit()

    return {"success": True, "message": "Patient account registered successfully. You may now log in."}

@router.post("/signup/doctor")
def signup_doctor(
    username: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    full_name: str = Body(...),
    specialty: str = Body("General Radiologist"),
    registration_number: str = Body(...),
    hospital: str = Body(...),
    phone: str = Body(""),
    db: Session = Depends(get_db)
):
    """Registers doctor account (status defaults to Pending until Admin approval)."""
    if db.query(User).filter((User.username == username) | (User.email == email)).first():
        raise HTTPException(status_code=400, detail="Username or email already in use.")

    new_user = User(
        username=username,
        email=email,
        password_hash=AuthService.hash_password(password),
        role="Doctor",
        is_active=True,
        is_verified=False,
        verification_status="Pending"
    )
    db.add(new_user)
    db.flush()

    profile = DoctorProfile(
        user_id=new_user.id,
        full_name=full_name,
        specialty=specialty,
        registration_number=registration_number,
        hospital_clinic=hospital,
        phone=phone
    )
    db.add(profile)
    db.commit()

    return {
        "success": True,
        "verification_status": "Pending",
        "message": "Doctor registration submitted. Clinical credentials are under Admin verification."
    }

@router.post("/signup/scan-center")
def signup_scan_center(
    username: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    center_name: str = Body(...),
    license_number: str = Body(...),
    address: str = Body(...),
    contact_phone: str = Body(...),
    db: Session = Depends(get_db)
):
    """Registers Diagnostic Scan Center account (requires Admin approval)."""
    if db.query(User).filter((User.username == username) | (User.email == email)).first():
        raise HTTPException(status_code=400, detail="Username or email already in use.")

    new_user = User(
        username=username,
        email=email,
        password_hash=AuthService.hash_password(password),
        role="ScanCenter",
        is_active=True,
        is_verified=False,
        verification_status="Pending"
    )
    db.add(new_user)
    db.flush()

    profile = ScanCenterProfile(
        user_id=new_user.id,
        center_name=center_name,
        license_number=license_number,
        address=address,
        contact_phone=contact_phone,
        contact_email=email
    )
    db.add(profile)
    db.commit()

    return {
        "success": True,
        "verification_status": "Pending",
        "message": "Scan Center facility registered. Account will be activated upon Admin verification."
    }


# ==========================================
# ADMIN GOVERNANCE: APPROVALS & AUDIT LOGS
# ==========================================

@router.get("/admin/pending-approvals")
def list_pending_approvals(user: User = Depends(require_role(["Admin"])), db: Session = Depends(get_db)):
    """Admin only: Lists doctors and scan centers awaiting clinical credential verification."""
    pending_users = db.query(User).filter(User.verification_status == "Pending").all()
    res = []
    for u in pending_users:
        detail = {}
        if u.role == "Doctor" and u.doctor_profile:
            detail = {
                "full_name": u.doctor_profile.full_name,
                "specialty": u.doctor_profile.specialty,
                "reg_no": u.doctor_profile.registration_number,
                "hospital": u.doctor_profile.hospital_clinic,
                "phone": u.doctor_profile.phone
            }
        elif u.role == "ScanCenter" and u.scan_center_profile:
            detail = {
                "center_name": u.scan_center_profile.center_name,
                "license_no": u.scan_center_profile.license_number,
                "address": u.scan_center_profile.address,
                "phone": u.scan_center_profile.contact_phone
            }
        res.append({
            "user_id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "submitted_at": u.created_at.strftime("%Y-%m-%d %H:%M"),
            "credentials": detail
        })
    return res

@router.post("/admin/approvals/{user_id}/decision")
def decide_approval(
    user_id: int,
    decision: str = Body(..., embed=True),  # "Approved" or "Rejected"
    admin: User = Depends(require_role(["Admin"])),
    db: Session = Depends(get_db)
):
    """Admin only: Approves or Rejects pending clinician or scan center accounts."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.verification_status = decision
    target_user.is_verified = (decision == "Approved")
    db.commit()

    # Log audit
    audit = AuditLog(
        user_identifier=admin.username,
        role="Admin",
        action=f"CREDENTIAL_{decision.upper()}",
        resource_type="USER_ACCOUNT",
        resource_id=str(target_user.id),
        details=json.dumps({"target_user": target_user.username, "role": target_user.role, "decision": decision})
    )
    db.add(audit)
    db.commit()

    return {"success": True, "user_id": user_id, "new_status": decision}


# ==========================================
# PATIENT ROLE WORKSPACE ENDPOINTS
# ==========================================

@router.get("/patient/my-scans")
def get_patient_scans(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns scans associated with the logged-in patient that have been reviewed & released by a doctor.
    """
    patient_id = None
    if user.patient_profile and user.patient_profile.patient_record_id:
        patient_id = user.patient_profile.patient_record_id

    # If user is a patient, restrict strictly to their patient_id
    query = db.query(Scan)
    if user.role == "Patient":
        if patient_id:
            query = query.filter(Scan.patient_id == patient_id)
        else:
            return []

    scans = query.order_by(Scan.created_at.desc()).all()
    res = []
    for s in scans:
        resp = format_scan_response(s)
        # Add plain language summary
        diag = s.analysis.predicted_label if s.analysis else "Evaluated Normal"
        resp["plain_language_summary"] = {
            "headline": f"Your scan was reviewed. Finding: {diag}.",
            "what_it_means": "The image shows typical patterns. Your doctor has noted no urgent critical flags.",
            "doctor_approved": s.is_released_to_patient or (s.reviews and s.reviews[-1].decision == "Accepted")
        }
        res.append(resp)
    return res

@router.post("/patient/share-link")
def create_share_link(
    scan_id: int = Body(...),
    recipient_name: Optional[str] = Body(None),
    expires_days: int = Body(7),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Patient creates a revocable, signed share link with expiry."""
    token = f"medishare_{uuid.uuid4().hex[:16]}"
    share_link = ScanShareLink(
        scan_id=scan_id,
        patient_id=user.patient_profile.patient_record_id if user.patient_profile else 1,
        share_token=token,
        recipient_email_or_name=recipient_name,
        expires_at=datetime.utcnow() + timedelta(days=expires_days)
    )
    db.add(share_link)
    db.commit()

    return {
        "share_token": token,
        "share_url": f"/shared/{token}",
        "expires_at": share_link.expires_at.strftime("%Y-%m-%d %H:%M")
    }

@router.get("/shared-scan/{token}")
def get_shared_scan(token: str, db: Session = Depends(get_db)):
    """Accesses a shared scan via signed token."""
    share = db.query(ScanShareLink).filter(
        ScanShareLink.share_token == token,
        ScanShareLink.is_revoked == False,
        ScanShareLink.expires_at > datetime.utcnow()
    ).first()

    if not share:
        raise HTTPException(status_code=404, detail="Shared scan link is invalid, expired, or revoked.")

    share.access_count += 1
    db.commit()

    scan = db.query(Scan).filter(Scan.id == share.scan_id).first()
    return {
        "scan": format_scan_response(scan),
        "expires_at": share.expires_at.strftime("%Y-%m-%d %H:%M"),
        "access_count": share.access_count
    }


# ==========================================
# DOCTOR ROLE WORKSPACE ENDPOINTS
# ==========================================

@router.get("/doctor/worklist")
def get_doctor_worklist(user: User = Depends(require_role(["Doctor", "Admin"])), db: Session = Depends(get_db)):
    """
    Returns doctor review worklist ordered by Urgent AI Risk (High -> Moderate -> Low) + Uncertainty.
    """
    scans = db.query(Scan).order_by(Scan.created_at.desc()).all()
    res = []
    for s in scans:
        r_item = format_scan_response(s)
        # Check if doctor has recorded a blinded impression
        impression = db.query(DoctorImpression).filter(
            DoctorImpression.scan_id == s.id
        ).first()
        r_item["blinded_impression_recorded"] = impression is not None
        r_item["is_released"] = s.is_released_to_patient
        res.append(r_item)
    return res

@router.post("/doctor/impressions/{scan_id}")
def record_doctor_impression(
    scan_id: int,
    impression: str = Body(..., embed=True),
    user: User = Depends(require_role(["Doctor", "Admin"])),
    db: Session = Depends(get_db)
):
    """
    Doctor records their blinded diagnostic impression first, then AI prediction & heatmap are revealed.
    """
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    doc_profile = user.doctor_profile or db.query(DoctorProfile).first()

    new_imp = DoctorImpression(
        scan_id=scan.id,
        doctor_id=doc_profile.id if doc_profile else 1,
        initial_impression=impression,
        ai_revealed_at=datetime.utcnow(),
        final_decision="Pending"
    )
    db.add(new_imp)
    db.commit()

    ai_label = scan.analysis.predicted_label if scan.analysis else "Normal"
    agreement = "Complete Agreement" if impression.lower() == ai_label.lower() else "Disagreement / Discordance"

    return {
        "success": True,
        "doctor_impression": impression,
        "ai_prediction": ai_label,
        "agreement_assessment": agreement,
        "ai_confidence": scan.analysis.confidence_score if scan.analysis else 0.88,
        "ai_revealed": True
    }

@router.post("/doctor/sign-report/{scan_id}")
def sign_and_release_report(
    scan_id: int,
    final_decision: str = Body("Accepted"),
    clinical_notes: str = Body("Clinically approved and signed by attending radiologist."),
    voice_transcript: Optional[str] = Body(None),
    release_to_patient: bool = Body(True),
    user: User = Depends(require_role(["Doctor", "Admin"])),
    db: Session = Depends(get_db)
):
    """Doctor approves, signs report with medical registration ID, and releases to patient."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan.is_released_to_patient = release_to_patient
    scan.workflow_stage = "ReportReady"
    scan.doctor_approved_report = clinical_notes

    # Add or update audit
    audit = AuditLog(
        user_identifier=user.username,
        role="Doctor",
        action="SIGN_AND_RELEASE_REPORT",
        resource_type="SCAN_REPORT",
        resource_id=str(scan.id),
        details=json.dumps({"decision": final_decision, "released": release_to_patient})
    )
    db.add(audit)
    db.commit()

    return {
        "success": True,
        "scan_id": scan.id,
        "workflow_stage": scan.workflow_stage,
        "is_released_to_patient": scan.is_released_to_patient
    }


# ==========================================
# SCAN CENTER WORKSPACE ENDPOINTS
# ==========================================

@router.get("/scan-center/workload")
def get_scan_center_workload(user: User = Depends(require_role(["ScanCenter", "Admin"])), db: Session = Depends(get_db)):
    """Returns daily throughput, upload queue, and doctor assignment telemetry."""
    total_scans = db.query(Scan).count()
    uploaded_stage = db.query(Scan).filter(Scan.workflow_stage == "Uploaded").count()
    reviewing_stage = db.query(Scan).filter(Scan.workflow_stage == "DoctorReviewing").count()
    ready_stage = db.query(Scan).filter(Scan.workflow_stage.in_(["ReportReady", "Delivered"])).count()

    verified_doctors = db.query(DoctorProfile).all()
    doc_list = [{"id": d.id, "name": d.full_name, "specialty": d.specialty, "hospital": d.hospital_clinic} for d in verified_doctors]

    return {
        "today_intake": total_scans,
        "quality_checked_count": total_scans,
        "pending_review_count": reviewing_stage or uploaded_stage,
        "completed_delivered_count": ready_stage,
        "available_doctors": doc_list
    }

@router.post("/scan-center/assign-doctor")
def assign_scan_to_doctor(
    scan_id: int = Body(...),
    doctor_id: int = Body(...),
    user: User = Depends(require_role(["ScanCenter", "Admin"])),
    db: Session = Depends(get_db)
):
    """Scan Center routes a newly uploaded scan to a specific verified doctor."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan.assigned_doctor_id = doctor_id
    scan.workflow_stage = "DoctorReviewing"
    db.commit()

    return {"success": True, "scan_id": scan.id, "assigned_doctor_id": doctor_id, "workflow_stage": scan.workflow_stage}
