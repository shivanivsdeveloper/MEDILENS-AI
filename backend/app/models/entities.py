from datetime import datetime
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from backend.app.models.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(64), unique=True, index=True, nullable=False)
    pseudonym = Column(String(128), nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String(16), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scans = relationship("Scan", back_populates="patient", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True, index=True)
    scan_uid = Column(String(64), unique=True, index=True, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    original_file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_format = Column(String(16), nullable=False)
    
    detected_modality = Column(String(64), default="Unknown")
    modality_confidence = Column(Float, default=0.0)
    
    quality_score = Column(Float, default=0.0)
    quality_category = Column(String(32), default="Unassessed")
    quality_metrics = Column(Text, default="{}")  # JSON string
    
    status = Column(String(32), default="Uploaded")  # Uploaded, Analyzing, Completed, Failed
    is_synthetic_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="scans")
    analysis = relationship("AnalysisResult", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("ReviewRecord", back_populates="scan", cascade="all, delete-orphan")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), unique=True, nullable=False, index=True)
    
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(32), nullable=False)
    modality = Column(String(64), nullable=False)
    
    predicted_label = Column(String(128), nullable=False)
    probability = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    uncertainty_score = Column(Float, nullable=False)
    entropy = Column(Float, nullable=False)
    
    is_ood = Column(Boolean, default=False)
    ood_score = Column(Float, default=0.0)
    
    risk_indicator = Column(String(32), nullable=False)  # Low, Moderate, High, Needs Review
    risk_rationale = Column(Text, nullable=True)
    
    heatmap_path = Column(String(512), nullable=True)
    elevation_data_path = Column(String(512), nullable=True)
    segmentation_mask_path = Column(String(512), nullable=True)
    
    measurements = Column(Text, default="{}")  # JSON string
    all_predictions = Column(Text, default="[]")  # JSON list
    ensemble_agreement = Column(Text, default="{}")  # JSON string
    
    inference_time_ms = Column(Float, default=0.0)
    is_demo_mode = Column(Boolean, default=False)
    safety_disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="analysis")
    review = relationship("ReviewRecord", back_populates="analysis", uselist=False)

class ReviewRecord(Base):
    __tablename__ = "review_records"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_results.id"), nullable=True, index=True)
    
    reviewer_name = Column(String(128), nullable=False)
    reviewer_role = Column(String(64), default="Clinical Reviewer")
    decision = Column(String(32), nullable=False)  # Pending, In Review, Accepted, Rejected, Corrected, Escalated
    
    original_label = Column(String(128), nullable=True)
    corrected_label = Column(String(128), nullable=True)
    clinical_notes = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    scan = relationship("Scan", back_populates="reviews")
    analysis = relationship("AnalysisResult", back_populates="review")

class HITLFeedback(Base):
    __tablename__ = "hitl_feedback"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, nullable=False, index=True)
    original_prediction = Column(String(128), nullable=False)
    validated_label = Column(String(128), nullable=False)
    reviewer_id = Column(String(128), nullable=False)
    reviewer_notes = Column(Text, nullable=True)
    model_version = Column(String(64), nullable=False)
    exported_to_dataset = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelEntry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    version = Column(String(32), nullable=False)
    architecture = Column(String(64), nullable=False)
    modality = Column(String(64), nullable=False)
    task_type = Column(String(64), nullable=False)
    dataset_name = Column(String(128), nullable=False)
    labels = Column(Text, default="[]")  # JSON list
    
    accuracy = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    roc_auc = Column(Float, default=0.0)
    sensitivity = Column(Float, default=0.0)
    specificity = Column(Float, default=0.0)
    inference_speed_ms = Column(Float, default=0.0)
    
    checkpoint_path = Column(String(512), nullable=True)
    is_active = Column(Boolean, default=True)
    is_installed = Column(Boolean, default=True)
    status = Column(String(32), default="Ready")  # Ready, Baseline, Training, Inactive
    created_at = Column(DateTime, default=datetime.utcnow)

class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    model_name = Column(String(128), nullable=False)
    dataset_name = Column(String(128), nullable=False)
    architecture = Column(String(64), nullable=False)
    
    epochs = Column(Integer, default=50)
    batch_size = Column(Integer, default=32)
    learning_rate = Column(Float, default=0.0001)
    optimizer = Column(String(32), default="AdamW")
    
    train_loss_history = Column(Text, default="[]")  # JSON list
    val_loss_history = Column(Text, default="[]")    # JSON list
    train_acc_history = Column(Text, default="[]")   # JSON list
    val_acc_history = Column(Text, default="[]")     # JSON list
    final_metrics = Column(Text, default="{}")       # JSON object
    
    notes = Column(Text, nullable=True)
    status = Column(String(32), default="Completed")
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_identifier = Column(String(128), default="system")
    role = Column(String(64), default="clinical_user")
    action = Column(String(64), nullable=False)
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(128), nullable=True)
    details = Column(Text, default="{}")  # JSON string
    ip_address = Column(String(64), default="127.0.0.1")

class CaseEmbedding(Base):
    __tablename__ = "case_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), unique=True, nullable=False, index=True)
    embedding_dim = Column(Integer, default=512)
    embedding_vector = Column(Text, nullable=False)  # JSON list of floats
    coord_2d_x = Column(Float, default=0.0)
    coord_2d_y = Column(Float, default=0.0)
    coord_3d_x = Column(Float, default=0.0)
    coord_3d_y = Column(Float, default=0.0)
    coord_3d_z = Column(Float, default=0.0)
    cluster_id = Column(Integer, default=0)
    cluster_label = Column(String(128), default="Unassigned")
    outlier_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Annotation(Base):
    __tablename__ = "annotations"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    author_name = Column(String(128), nullable=False)
    author_role = Column(String(64), default="Radiologist")
    annotation_type = Column(String(32), default="bounding_box")  # bounding_box, polygon, point, segmentation_mask
    label = Column(String(128), nullable=False)
    data_json = Column(Text, nullable=False)  # Coordinates / geometry JSON
    confidence = Column(Float, default=1.0)
    current_version = Column(Integer, default=1)
    status = Column(String(32), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnnotationVersion(Base):
    __tablename__ = "annotation_versions"

    id = Column(Integer, primary_key=True, index=True)
    annotation_id = Column(Integer, ForeignKey("annotations.id"), nullable=False, index=True)
    version_num = Column(Integer, nullable=False)
    data_json = Column(Text, nullable=False)
    author_name = Column(String(128), nullable=False)
    change_summary = Column(String(255), default="Updated geometry")
    created_at = Column(DateTime, default=datetime.utcnow)

class ModelCard(Base):
    __tablename__ = "model_cards"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(64), unique=True, nullable=False, index=True)
    intended_use = Column(Text, nullable=False)
    non_intended_use = Column(Text, nullable=False)
    training_data_summary = Column(Text, nullable=True)
    ethical_considerations = Column(Text, nullable=True)
    limitations_known = Column(Text, nullable=True)
    performance_breakdown = Column(Text, default="{}")  # JSON metrics
    approved_by = Column(String(128), default="Clinical Review Board")
    approval_status = Column(String(32), default="Approved")
    created_at = Column(DateTime, default=datetime.utcnow)

class DatasetCard(Base):
    __tablename__ = "dataset_cards"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String(128), unique=True, nullable=False, index=True)
    version = Column(String(32), default="1.0.0")
    source_origin = Column(String(255), nullable=False)
    sample_count = Column(Integer, default=0)
    modalities = Column(Text, default="[]")  # JSON list
    class_distribution = Column(Text, default="{}")  # JSON dict
    split_strategy = Column(String(64), default="Patient-Aware 70/15/15")
    leakage_risk_score = Column(Float, default=0.0)
    health_score = Column(Float, default=100.0)
    known_limitations = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class StressTestRun(Base):
    __tablename__ = "stress_test_runs"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(64), nullable=False, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False, index=True)
    perturbation_type = Column(String(64), nullable=False)  # gaussian_noise, blur, contrast, brightness, rotation, compression, resolution
    severity_level = Column(Float, default=0.5)
    original_prediction = Column(String(128), nullable=False)
    original_confidence = Column(Float, nullable=False)
    perturbed_prediction = Column(String(128), nullable=False)
    perturbed_confidence = Column(Float, nullable=False)
    prediction_maintained = Column(Boolean, default=True)
    stability_score = Column(Float, default=1.0)
    gradcam_stability_score = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class DriftRecord(Base):
    __tablename__ = "drift_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    sample_window_size = Column(Integer, default=50)
    feature_drift_score = Column(Float, default=0.0)
    prediction_drift_score = Column(Float, default=0.0)
    ks_test_p_value = Column(Float, default=1.0)
    status = Column(String(32), default="Stable")  # Stable, Minor Drift, Critical Drift
    details = Column(Text, default="{}")
