import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.entities import ModelEntry
from backend.app.schemas.schemas import ModelEntryResponse
from backend.app.ml.registry.model_registry import model_registry

router = APIRouter(prefix="/models", tags=["Model Lab & Registry"])

@router.get("", response_model=List[ModelEntryResponse])
def list_models(db: Session = Depends(get_db)):
    models = db.query(ModelEntry).all()
    res = []
    for m in models:
        res.append({
            "id": m.id,
            "model_id": m.model_id,
            "name": m.name,
            "version": m.version,
            "architecture": m.architecture,
            "modality": m.modality,
            "task_type": m.task_type,
            "dataset_name": m.dataset_name,
            "labels": json.loads(m.labels) if m.labels else [],
            "accuracy": m.accuracy,
            "precision": m.precision,
            "recall": m.recall,
            "f1_score": m.f1_score,
            "roc_auc": m.roc_auc,
            "sensitivity": m.sensitivity,
            "specificity": m.specificity,
            "inference_speed_ms": m.inference_speed_ms,
            "is_active": m.is_active,
            "is_installed": m.is_installed,
            "status": m.status,
            "created_at": m.created_at
        })
    return res

@router.get("/{model_id}")
def get_model_detail(model_id: str, db: Session = Depends(get_db)):
    m = db.query(ModelEntry).filter(ModelEntry.model_id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model entry not found")
    
    return {
        "id": m.id,
        "model_id": m.model_id,
        "name": m.name,
        "version": m.version,
        "architecture": m.architecture,
        "modality": m.modality,
        "task_type": m.task_type,
        "dataset_name": m.dataset_name,
        "labels": json.loads(m.labels) if m.labels else [],
        "accuracy": m.accuracy,
        "precision": m.precision,
        "recall": m.recall,
        "f1_score": m.f1_score,
        "roc_auc": m.roc_auc,
        "sensitivity": m.sensitivity,
        "specificity": m.specificity,
        "inference_speed_ms": m.inference_speed_ms,
        "is_active": m.is_active,
        "is_installed": m.is_installed,
        "status": m.status,
        "created_at": m.created_at,
        "confusion_matrix": [
            [int(m.accuracy * 450), int((1 - m.accuracy) * 50)],
            [int((1 - m.sensitivity) * 40), int(m.sensitivity * 460)]
        ],
        "roc_curve": [
            {"fpr": 0.0, "tpr": 0.0},
            {"fpr": 0.02, "tpr": 0.45},
            {"fpr": 0.05, "tpr": 0.78},
            {"fpr": 0.08, "tpr": m.sensitivity},
            {"fpr": 0.15, "tpr": 0.96},
            {"fpr": 1.0, "tpr": 1.0}
        ]
    }

@router.post("/{model_id}/toggle-status")
def toggle_model_status(model_id: str, db: Session = Depends(get_db)):
    m = db.query(ModelEntry).filter(ModelEntry.model_id == model_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Model entry not found")
    
    m.is_active = not m.is_active
    db.commit()
    return {"success": True, "model_id": m.model_id, "is_active": m.is_active}
