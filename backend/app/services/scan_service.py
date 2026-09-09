import os
import uuid
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from backend.app.config.settings import settings
from backend.app.models.entities import Scan, AnalysisResult, Patient, AuditLog, ReviewRecord
from backend.app.ml.preprocessing.quality_engine import ImageQualityEngine
from backend.app.ml.modality_detector import ModalityDetector
from backend.app.ml.registry.model_registry import model_registry
from backend.app.reports.pdf_generator import PDFReportGenerator

class ScanService:
    @staticmethod
    def upload_scan(
        file: UploadFile,
        db: Session,
        patient_id: Optional[int] = None,
        is_synthetic: bool = False
    ) -> Scan:
        # 1. Validate file extension
        ext = Path(file.filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: {settings.ALLOWED_EXTENSIONS}")

        # 2. Save file
        scan_uid = f"SCN-{uuid.uuid4().hex[:8].upper()}"
        saved_filename = f"{scan_uid}{ext}"
        saved_path = settings.UPLOAD_DIR / saved_filename

        with open(saved_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = os.path.getsize(saved_path)

        # 3. Assess image quality
        quality_score, quality_cat, quality_meta = ImageQualityEngine.assess_quality(str(saved_path))

        # 4. Detect modality
        detected_mod, mod_conf, mod_meta = ModalityDetector.detect_modality(str(saved_path))
        quality_meta["modality_detection_features"] = mod_meta

        # 5. Create database entity
        scan = Scan(
            patient_id=patient_id,
            scan_uid=scan_uid,
            file_name=saved_filename,
            file_path=str(saved_path),
            original_file_name=file.filename,
            file_size_bytes=file_size,
            file_format=ext.replace(".", "").upper(),
            detected_modality=detected_mod,
            modality_confidence=mod_conf,
            quality_score=quality_score,
            quality_category=quality_cat,
            quality_metrics=json.dumps(quality_meta),
            status="Uploaded",
            is_synthetic_demo=is_synthetic
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        # Audit log
        audit = AuditLog(
            action="SCAN_UPLOADED",
            resource_type="scan",
            resource_id=scan.scan_uid,
            details=json.dumps({"filename": file.filename, "size": file_size, "modality": detected_mod})
        )
        db.add(audit)
        db.commit()

        return scan

    @staticmethod
    def analyze_scan(scan_id: int, db: Session, model_id: Optional[str] = None) -> AnalysisResult:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")

        # Select module
        if model_id:
            module = model_registry.get_module_by_id(model_id)
        else:
            module = model_registry.get_module_for_modality(scan.detected_modality)

        if not module:
            raise HTTPException(status_code=500, detail=f"No active diagnostic module found for modality '{scan.detected_modality}'")

        # Execute ML inference
        pred_dict = module.predict(image_path=scan.file_path, quality_score=scan.quality_score)

        # Check existing analysis
        existing = db.query(AnalysisResult).filter(AnalysisResult.scan_id == scan_id).first()
        if existing:
            db.delete(existing)
            db.commit()

        # Create AnalysisResult
        analysis = AnalysisResult(
            scan_id=scan.id,
            model_name=pred_dict["model_name"],
            model_version=pred_dict["model_version"],
            modality=pred_dict["modality"],
            predicted_label=pred_dict["predicted_label"],
            probability=pred_dict["probability"],
            confidence_score=pred_dict["confidence_score"],
            uncertainty_score=pred_dict["uncertainty_score"],
            entropy=pred_dict["entropy"],
            is_ood=pred_dict["is_ood"],
            ood_score=pred_dict["ood_score"],
            risk_indicator=pred_dict["risk_indicator"],
            risk_rationale=pred_dict["risk_rationale"],
            heatmap_path=pred_dict["heatmap_path"],
            elevation_data_path=json.dumps(pred_dict["elevation_grid"]),
            segmentation_mask_path=pred_dict["segmentation_mask_path"],
            measurements=json.dumps(pred_dict["measurements"]),
            all_predictions=json.dumps(pred_dict["all_predictions"]),
            ensemble_agreement=json.dumps(pred_dict["ensemble_agreement"]),
            inference_time_ms=pred_dict["inference_time_ms"],
            is_demo_mode=pred_dict["is_demo_mode"],
            safety_disclaimer=pred_dict["safety_disclaimer"]
        )
        db.add(analysis)

        scan.status = "Completed"
        db.commit()
        db.refresh(analysis)

        # Audit log
        audit = AuditLog(
            action="SCAN_ANALYZED",
            resource_type="analysis",
            resource_id=str(analysis.id),
            details=json.dumps({"scan_uid": scan.scan_uid, "predicted_label": analysis.predicted_label, "risk": analysis.risk_indicator})
        )
        db.add(audit)
        db.commit()

        return analysis

    @staticmethod
    def generate_pdf_report(scan_id: int, db: Session) -> str:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan or not scan.analysis:
            raise HTTPException(status_code=400, detail="Scan has not undergone AI screening yet.")

        analysis = scan.analysis
        patient = scan.patient
        patient_ref = patient.reference_id if patient else f"REF-{scan.scan_uid[:6]}"
        patient_age = str(patient.age) if patient and patient.age else "N/A"
        patient_sex = str(patient.sex) if patient and patient.sex else "N/A"

        # Check latest review
        latest_review = db.query(ReviewRecord).filter(ReviewRecord.scan_id == scan_id).order_by(ReviewRecord.reviewed_at.desc()).first()
        rev_name = latest_review.reviewer_name if latest_review else "Dr. S. Clinical Radiologist"
        rev_decision = latest_review.decision if latest_review else "Preliminary Automated Screening"
        rev_notes = latest_review.clinical_notes if latest_review and latest_review.clinical_notes else "Automated screening generated. Awaiting clinician sign-off."

        pdf_filename = f"report_{scan.scan_uid}.pdf"
        pdf_path = str(settings.REPORTS_DIR / pdf_filename)

        PDFReportGenerator.generate_report(
            output_pdf_path=pdf_path,
            patient_ref=patient_ref,
            patient_age=patient_age,
            patient_sex=patient_sex,
            scan_date=scan.created_at.strftime("%Y-%m-%d %H:%M"),
            modality=scan.detected_modality,
            quality_score=scan.quality_score,
            quality_category=scan.quality_category,
            predicted_label=analysis.predicted_label,
            confidence_pct=round(analysis.probability * 100.0, 1),
            uncertainty_score=analysis.uncertainty_score,
            risk_indicator=analysis.risk_indicator,
            risk_rationale=analysis.risk_rationale or "Routine algorithmic assessment.",
            model_name=analysis.model_name,
            model_version=analysis.model_version,
            original_image_path=scan.file_path,
            heatmap_image_path=analysis.heatmap_path or "",
            reviewer_name=rev_name,
            reviewer_decision=rev_decision,
            reviewer_notes=rev_notes
        )

        return pdf_path
