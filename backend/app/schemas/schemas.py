from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Base & Generic
class APIResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None

# Patient Schemas
class PatientBase(BaseModel):
    reference_id: str
    pseudonym: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    notes: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    scans_count: Optional[int] = 0

    class Config:
        from_attributes = True

# Quality Metrics
class QualityMetrics(BaseModel):
    sharpness_score: float
    contrast_score: float
    exposure_score: float
    snr_score: float
    resolution_score: float
    blur_detected: bool
    under_exposed: bool
    over_exposed: bool
    aspect_ratio: float
    dimensions: List[int]
    status_summary: str

# Scan Schemas
class ScanBase(BaseModel):
    patient_id: Optional[int] = None
    original_file_name: str
    detected_modality: str
    quality_score: float
    quality_category: str

class ScanResponse(BaseModel):
    id: int
    scan_uid: str
    patient_id: Optional[int] = None
    patient_reference_id: Optional[str] = None
    file_name: str
    file_url: str
    original_file_name: str
    file_size_bytes: int
    file_format: str
    detected_modality: str
    modality_confidence: float
    quality_score: float
    quality_category: str
    quality_metrics: Dict[str, Any]
    status: str
    is_synthetic_demo: bool
    created_at: datetime
    has_analysis: bool = False
    predicted_label: Optional[str] = None
    risk_indicator: Optional[str] = None
    review_status: Optional[str] = "Unreviewed"

    class Config:
        from_attributes = True

# Prediction Detail
class PredictionItem(BaseModel):
    label: str
    probability: float
    percentage: float
    is_primary: bool = False

# Analysis Schemas
class AnalysisResultResponse(BaseModel):
    id: int
    scan_id: int
    scan_uid: str
    model_name: str
    model_version: str
    modality: str
    predicted_label: str
    probability: float
    confidence_score: float
    uncertainty_score: float
    entropy: float
    is_ood: bool
    ood_score: float
    risk_indicator: str
    risk_rationale: Optional[str]
    heatmap_url: Optional[str] = None
    elevation_data_url: Optional[str] = None
    segmentation_mask_url: Optional[str] = None
    elevation_grid: Optional[List[List[float]]] = None
    measurements: Dict[str, Any]
    all_predictions: List[PredictionItem]
    ensemble_agreement: Dict[str, Any]
    inference_time_ms: float
    is_demo_mode: bool
    safety_disclaimer: str
    created_at: datetime

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    scan_id: int
    decision: str  # Pending, In Review, Accepted, Rejected, Corrected, Escalated
    reviewer_name: str = "Dr. S. Clinical Specialist"
    reviewer_role: str = "Lead Radiologist"
    corrected_label: Optional[str] = None
    clinical_notes: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    scan_id: int
    analysis_id: Optional[int]
    reviewer_name: str
    reviewer_role: str
    decision: str
    original_label: Optional[str]
    corrected_label: Optional[str]
    clinical_notes: Optional[str]
    reviewed_at: datetime

    class Config:
        from_attributes = True

# Model Registry Schemas
class ModelEntryResponse(BaseModel):
    id: int
    model_id: str
    name: str
    version: str
    architecture: str
    modality: str
    task_type: str
    dataset_name: str
    labels: List[str]
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    sensitivity: float
    specificity: float
    inference_speed_ms: float
    is_active: bool
    is_installed: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Experiment Schemas
class ExperimentResponse(BaseModel):
    id: int
    experiment_id: str
    name: str
    model_name: str
    dataset_name: str
    architecture: str
    epochs: int
    batch_size: int
    learning_rate: float
    optimizer: str
    train_loss_history: List[float]
    val_loss_history: List[float]
    train_acc_history: List[float]
    val_acc_history: List[float]
    final_metrics: Dict[str, Any]
    notes: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Summary
class DashboardAnalytics(BaseModel):
    total_scans: int
    today_scans: int
    reviewed_cases: int
    pending_reviews: int
    abnormal_screenings: int
    average_inference_time_ms: float
    system_health: str
    models_active_count: int
    scan_volume_trend: List[Dict[str, Any]]
    risk_distribution: Dict[str, int]
    modality_breakdown: Dict[str, int]
    recent_scans: List[ScanResponse]

# Audit Log
class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_identifier: str
    role: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Dict[str, Any]
    ip_address: str

    class Config:
        from_attributes = True
