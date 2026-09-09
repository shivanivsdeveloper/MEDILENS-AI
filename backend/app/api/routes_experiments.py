import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.entities import Experiment
from backend.app.schemas.schemas import ExperimentResponse

router = APIRouter(prefix="/experiments", tags=["Experiment Tracking"])

@router.get("", response_model=List[ExperimentResponse])
def list_experiments(db: Session = Depends(get_db)):
    exps = db.query(Experiment).order_by(Experiment.created_at.desc()).all()
    res = []
    for e in exps:
        res.append({
            "id": e.id,
            "experiment_id": e.experiment_id,
            "name": e.name,
            "model_name": e.model_name,
            "dataset_name": e.dataset_name,
            "architecture": e.architecture,
            "epochs": e.epochs,
            "batch_size": e.batch_size,
            "learning_rate": e.learning_rate,
            "optimizer": e.optimizer,
            "train_loss_history": json.loads(e.train_loss_history) if e.train_loss_history else [],
            "val_loss_history": json.loads(e.val_loss_history) if e.val_loss_history else [],
            "train_acc_history": json.loads(e.train_acc_history) if e.train_acc_history else [],
            "val_acc_history": json.loads(e.val_acc_history) if e.val_acc_history else [],
            "final_metrics": json.loads(e.final_metrics) if e.final_metrics else {},
            "notes": e.notes,
            "status": e.status,
            "created_at": e.created_at
        })
    return res
