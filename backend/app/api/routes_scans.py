import os
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.entities import Scan, AnalysisResult, Patient, ReviewRecord
from backend.app.schemas.schemas import ScanResponse, AnalysisResultResponse, APIResponse
from backend.app.services.scan_service import ScanService

router = APIRouter(prefix="/scans", tags=["Scans & Inference"])

def format_scan_response(scan: Scan) -> dict:
    has_analysis = scan.analysis is not None
    pred_label = scan.analysis.predicted_label if has_analysis else None
    risk_ind = scan.analysis.risk_indicator if has_analysis else None
    
    # Review status
    rev = scan.reviews[-1] if scan.reviews else None
    rev_status = rev.decision if rev else "Unreviewed"

    return {
        "id": scan.id,
        "scan_uid": scan.scan_uid,
        "patient_id": scan.patient_id,
        "patient_reference_id": scan.patient.reference_id if scan.patient else None,
        "file_name": scan.file_name,
        "file_url": f"/static/raw/{scan.file_name}",
        "original_file_name": scan.original_file_name,
        "file_size_bytes": scan.file_size_bytes,
        "file_format": scan.file_format,
        "detected_modality": scan.detected_modality,
        "modality_confidence": scan.modality_confidence,
        "quality_score": scan.quality_score,
        "quality_category": scan.quality_category,
        "quality_metrics": json.loads(scan.quality_metrics) if scan.quality_metrics else {},
        "status": scan.status,
        "is_synthetic_demo": scan.is_synthetic_demo,
        "created_at": scan.created_at,
        "has_analysis": has_analysis,
        "predicted_label": pred_label,
        "risk_indicator": risk_ind,
        "review_status": rev_status
    }

@router.get("", response_model=List[ScanResponse])
def list_scans(
    modality: Optional[str] = None,
    risk: Optional[str] = None,
    patient_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = db.query(Scan)
    if modality and modality != "All":
        query = query.filter(Scan.detected_modality == modality)
    if patient_id:
        query = query.filter(Scan.patient_id == patient_id)
    
    scans = query.order_by(Scan.created_at.desc()).offset(skip).limit(limit).all()
    results = [format_scan_response(s) for s in scans]
    
    if risk and risk != "All":
        results = [r for r in results if r["risk_indicator"] == risk]

    return results

@router.post("/upload")
def upload_scan(
    file: UploadFile = File(...),
    patient_id: Optional[int] = Form(None),
    auto_analyze: bool = Form(True),
    db: Session = Depends(get_db)
):
    scan = ScanService.upload_scan(file=file, db=db, patient_id=patient_id)
    
    if auto_analyze:
        try:
            ScanService.analyze_scan(scan_id=scan.id, db=db)
            db.refresh(scan)
        except Exception as e:
            print(f"Auto-analyze exception: {e}")

    return {
        "success": True,
        "message": "Scan uploaded and processed successfully",
        "data": format_scan_response(scan)
    }

@router.post("/batch-upload")
def batch_upload_scans(
    files: List[UploadFile] = File(...),
    patient_id: Optional[int] = Form(None),
    auto_analyze: bool = Form(True),
    db: Session = Depends(get_db)
):
    processed = []
    for file in files:
        try:
            scan = ScanService.upload_scan(file=file, db=db, patient_id=patient_id)
            if auto_analyze:
                ScanService.analyze_scan(scan_id=scan.id, db=db)
                db.refresh(scan)
            processed.append(format_scan_response(scan))
        except Exception as e:
            print(f"Batch upload item error: {e}")

    return {
        "success": True,
        "uploaded_count": len(processed),
        "data": processed
    }

@router.get("/{scan_id}")
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    data = format_scan_response(scan)
    
    if scan.analysis:
        a = scan.analysis
        data["analysis"] = {
            "id": a.id,
            "scan_id": a.scan_id,
            "scan_uid": scan.scan_uid,
            "model_name": a.model_name,
            "model_version": a.model_version,
            "modality": a.modality,
            "predicted_label": a.predicted_label,
            "probability": a.probability,
            "confidence_score": a.confidence_score,
            "uncertainty_score": a.uncertainty_score,
            "entropy": a.entropy,
            "is_ood": a.is_ood,
            "ood_score": a.ood_score,
            "risk_indicator": a.risk_indicator,
            "risk_rationale": a.risk_rationale,
            "heatmap_url": f"/static/outputs/{os.path.basename(a.heatmap_path)}" if a.heatmap_path else None,
            "segmentation_mask_url": f"/static/outputs/{os.path.basename(a.segmentation_mask_path)}" if a.segmentation_mask_path else None,
            "elevation_grid": json.loads(a.elevation_data_path) if a.elevation_data_path else None,
            "measurements": json.loads(a.measurements) if a.measurements else {},
            "all_predictions": json.loads(a.all_predictions) if a.all_predictions else [],
            "ensemble_agreement": json.loads(a.ensemble_agreement) if a.ensemble_agreement else {},
            "inference_time_ms": a.inference_time_ms,
            "is_demo_mode": a.is_demo_mode,
            "safety_disclaimer": a.safety_disclaimer,
            "created_at": a.created_at
        }
    else:
        data["analysis"] = None

    return data

@router.post("/{scan_id}/analyze")
def trigger_analysis(
    scan_id: int,
    model_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    analysis = ScanService.analyze_scan(scan_id=scan_id, db=db, model_id=model_id)
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    return {
        "success": True,
        "message": "AI analysis completed",
        "data": get_scan(scan_id, db)
    }

@router.get("/{scan_id}/report")
def get_pdf_report(scan_id: int, db: Session = Depends(get_db)):
    pdf_path = ScanService.generate_pdf_report(scan_id=scan_id, db=db)
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Report generation failed")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=os.path.basename(pdf_path)
    )

@router.delete("/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Remove file from disk if exists
    if os.path.exists(scan.file_path):
        try:
            os.remove(scan.file_path)
        except Exception:
            pass

    db.delete(scan)
    db.commit()
    return {"success": True, "message": "Scan record deleted"}
