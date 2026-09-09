from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.models.database import get_db
from backend.app.models.entities import Scan, AnalysisResult, ReviewRecord, HITLFeedback, AuditLog
from backend.app.schemas.schemas import ReviewCreate, ReviewResponse
from backend.app.api.routes_scans import format_scan_response

router = APIRouter(prefix="/reviews", tags=["Review Queue & HITL"])

@router.get("/queue")
def get_review_queue(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Fetch all scans that have analysis results
    scans = db.query(Scan).filter(Scan.analysis != None).order_by(Scan.created_at.desc()).all()
    queue = []
    
    for s in scans:
        latest_rev = s.reviews[-1] if s.reviews else None
        current_status = latest_rev.decision if latest_rev else "Pending"
        
        if status and status != "All" and current_status != status:
            continue

        queue.append({
            "scan_id": s.id,
            "scan_uid": s.scan_uid,
            "patient_reference_id": s.patient.reference_id if s.patient else "Unassigned",
            "file_url": f"/static/raw/{s.file_name}",
            "modality": s.detected_modality,
            "quality_score": s.quality_score,
            "predicted_label": s.analysis.predicted_label,
            "confidence_pct": round(s.analysis.probability * 100.0, 1),
            "uncertainty_score": s.analysis.uncertainty_score,
            "risk_indicator": s.analysis.risk_indicator,
            "review_status": current_status,
            "reviewer_name": latest_rev.reviewer_name if latest_rev else None,
            "reviewer_notes": latest_rev.clinical_notes if latest_rev else None,
            "reviewed_at": latest_rev.reviewed_at if latest_rev else None,
            "created_at": s.created_at
        })

    return queue

@router.post("", response_model=ReviewResponse)
def submit_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == payload.scan_id).first()
    if not scan or not scan.analysis:
        raise HTTPException(status_code=400, detail="Scan does not exist or has not been analyzed.")

    analysis = scan.analysis

    review = ReviewRecord(
        scan_id=scan.id,
        analysis_id=analysis.id,
        reviewer_name=payload.reviewer_name,
        reviewer_role=payload.reviewer_role,
        decision=payload.decision,
        original_label=analysis.predicted_label,
        corrected_label=payload.corrected_label or analysis.predicted_label,
        clinical_notes=payload.clinical_notes,
        reviewed_at=datetime.utcnow()
    )
    db.add(review)

    # If label was corrected or accepted, store in HITL Feedback repository
    hitl = HITLFeedback(
        scan_id=scan.id,
        original_prediction=analysis.predicted_label,
        validated_label=payload.corrected_label if payload.corrected_label else analysis.predicted_label,
        reviewer_id=payload.reviewer_name,
        reviewer_notes=payload.clinical_notes,
        model_version=analysis.model_version
    )
    db.add(hitl)
    
    # Audit trail
    audit = AuditLog(
        action=f"REVIEW_{payload.decision.upper()}",
        resource_type="review",
        resource_id=str(scan.scan_uid),
        details=str({"decision": payload.decision, "corrected": payload.corrected_label})
    )
    db.add(audit)

    db.commit()
    db.refresh(review)

    return {
        "id": review.id,
        "scan_id": review.scan_id,
        "analysis_id": review.analysis_id,
        "reviewer_name": review.reviewer_name,
        "reviewer_role": review.reviewer_role,
        "decision": review.decision,
        "original_label": review.original_label,
        "corrected_label": review.corrected_label,
        "clinical_notes": review.clinical_notes,
        "reviewed_at": review.reviewed_at
    }

@router.get("/feedback")
def list_hitl_feedback(db: Session = Depends(get_db)):
    feedback_records = db.query(HITLFeedback).order_by(HITLFeedback.created_at.desc()).all()
    return [{
        "id": f.id,
        "scan_id": f.scan_id,
        "original_prediction": f.original_prediction,
        "validated_label": f.validated_label,
        "reviewer_id": f.reviewer_id,
        "reviewer_notes": f.reviewer_notes,
        "model_version": f.model_version,
        "exported_to_dataset": f.exported_to_dataset,
        "created_at": f.created_at
    } for f in feedback_records]
