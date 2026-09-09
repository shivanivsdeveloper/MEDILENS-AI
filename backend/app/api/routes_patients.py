from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.models.database import get_db
from backend.app.models.entities import Patient, Scan
from backend.app.schemas.schemas import PatientCreate, PatientResponse, ScanResponse
from backend.app.api.routes_scans import format_scan_response

router = APIRouter(prefix="/patients", tags=["Patient Management"])

@router.get("", response_model=List[PatientResponse])
def list_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    patients = db.query(Patient).order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()
    res = []
    for p in patients:
        res.append({
            "id": p.id,
            "reference_id": p.reference_id,
            "pseudonym": p.pseudonym,
            "age": p.age,
            "sex": p.sex,
            "notes": p.notes,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "scans_count": len(p.scans)
        })
    return res

@router.post("", response_model=PatientResponse)
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter(Patient.reference_id == payload.reference_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient with this reference ID already exists")

    patient = Patient(
        reference_id=payload.reference_id,
        pseudonym=payload.pseudonym,
        age=payload.age,
        sex=payload.sex,
        notes=payload.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return {
        "id": patient.id,
        "reference_id": patient.reference_id,
        "pseudonym": patient.pseudonym,
        "age": patient.age,
        "sex": patient.sex,
        "notes": patient.notes,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "scans_count": 0
    }

@router.get("/{patient_id}")
def get_patient_detail(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    scans = [format_scan_response(s) for s in patient.scans]
    return {
        "id": patient.id,
        "reference_id": patient.reference_id,
        "pseudonym": patient.pseudonym,
        "age": patient.age,
        "sex": patient.sex,
        "notes": patient.notes,
        "created_at": patient.created_at,
        "updated_at": patient.updated_at,
        "scans": scans
    }
