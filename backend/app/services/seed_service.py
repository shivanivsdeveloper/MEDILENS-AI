import os
import shutil
import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.app.config.settings import settings
from backend.app.models.entities import Patient, Scan, AnalysisResult, ModelEntry, Experiment, ReviewRecord, AuditLog
from backend.app.services.auth_service import AuthService

class SeedService:
    @staticmethod
    def create_sample_images():
        """
        Creates lightweight sample image files for demo purposes if not present.
        """
        sample_dir = settings.SAMPLE_DIR
        sample_dir.mkdir(parents=True, exist_ok=True)

        sample_files = [
            "sample_cxr_pneumonia.png",
            "sample_cxr_normal.png",
            "sample_retinal_fundus.png",
            "sample_skin_lesion.png",
            "sample_brain_mri.png"
        ]

        # 1x1 minimal transparent PNG byte header fallback if file not on disk
        minimal_png = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x01\x00\x00\x00\x01\x00'
            b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff'
            b'?\x00\x05\xfe\x02\xfe\r\xef\x8f\x8d\x00\x00\x00\x00IEND\xaeB`\x82'
        )

        for s_file in sample_files:
            file_path = sample_dir / s_file
            if not file_path.exists():
                with open(file_path, "wb") as f:
                    f.write(minimal_png)

    @staticmethod
    def seed_initial_data(db: Session):
        """
        Populates initial database entries cleanly without loading ML models or running inference.
        """
        SeedService.create_sample_images()
        AuthService.seed_users(db)

        # 1. Seed Model Registry Entries
        if db.query(ModelEntry).count() == 0:
            models_data = [
                {
                    "model_id": "mod_chest_xray_v2",
                    "name": "Chest Radiograph Screening Suite",
                    "version": "2.4.1",
                    "architecture": "ResNet-50",
                    "modality": "Chest X-ray",
                    "task_type": "Multi-Class Abnormality Classification",
                    "dataset_name": "NIH ChestX-ray14 & CheXpert Benchmark",
                    "labels": ["Normal", "Pneumonia", "Infiltration", "Effusion", "Atelectasis", "Nodule"],
                    "accuracy": 0.932,
                    "precision": 0.918,
                    "recall": 0.925,
                    "f1_score": 0.921,
                    "roc_auc": 0.964,
                    "sensitivity": 0.925,
                    "specificity": 0.941,
                    "inference_speed_ms": 68.5,
                    "is_active": True,
                    "is_installed": True,
                    "status": "Ready"
                },
                {
                    "model_id": "mod_retinal_v2",
                    "name": "Retinal Fundus Screening Suite",
                    "version": "2.1.0",
                    "architecture": "ResNet-50",
                    "modality": "Retinal Fundus",
                    "task_type": "Retinopathy & Glaucoma Stratification",
                    "dataset_name": "EyePACS & Messidor-2 Clinical Cohort",
                    "labels": ["Normal", "Diabetic Retinopathy", "Glaucoma", "AMD"],
                    "accuracy": 0.945,
                    "precision": 0.931,
                    "recall": 0.940,
                    "f1_score": 0.935,
                    "roc_auc": 0.978,
                    "sensitivity": 0.940,
                    "specificity": 0.952,
                    "inference_speed_ms": 72.0,
                    "is_active": True,
                    "is_installed": True,
                    "status": "Ready"
                },
                {
                    "model_id": "mod_skin_lesion_v2",
                    "name": "Dermatological Lesion Classifier",
                    "version": "2.0.4",
                    "architecture": "ResNet-50",
                    "modality": "Skin Lesion",
                    "task_type": "Melanocytic Lesion Biopsy Decision Support",
                    "dataset_name": "ISIC 2019 International Skin Imaging",
                    "labels": ["Benign Nevus", "Melanoma", "Basal Cell Carcinoma"],
                    "accuracy": 0.918,
                    "precision": 0.902,
                    "recall": 0.914,
                    "f1_score": 0.908,
                    "roc_auc": 0.952,
                    "sensitivity": 0.914,
                    "specificity": 0.926,
                    "inference_speed_ms": 65.0,
                    "is_active": True,
                    "is_installed": True,
                    "status": "Ready"
                },
                {
                    "model_id": "mod_bone_xray_v2",
                    "name": "Musculoskeletal Radiograph Analyzer",
                    "version": "2.0.1",
                    "architecture": "ResNet-50",
                    "modality": "Bone X-ray",
                    "task_type": "Fracture & Trabecular Density Screening",
                    "dataset_name": "Stanford MURA Musculoskeletal Radiographs",
                    "labels": ["Normal", "Fracture", "Osteopenia"],
                    "accuracy": 0.924,
                    "precision": 0.911,
                    "recall": 0.919,
                    "f1_score": 0.915,
                    "roc_auc": 0.961,
                    "sensitivity": 0.919,
                    "specificity": 0.935,
                    "inference_speed_ms": 69.2,
                    "is_active": True,
                    "is_installed": True,
                    "status": "Ready"
                },
                {
                    "model_id": "mod_brain_mri_v2",
                    "name": "Neuro-Imaging Brain MRI Suite",
                    "version": "2.2.0",
                    "architecture": "ResNet-50",
                    "modality": "Brain MRI",
                    "task_type": "Intracranial Neoplasm Localization",
                    "dataset_name": "BraTS 2021 Multi-Modal Brain Tumor Dataset",
                    "labels": ["No Tumor", "Glioma", "Meningioma", "Pituitary"],
                    "accuracy": 0.951,
                    "precision": 0.942,
                    "recall": 0.948,
                    "f1_score": 0.945,
                    "roc_auc": 0.982,
                    "sensitivity": 0.948,
                    "specificity": 0.960,
                    "inference_speed_ms": 74.5,
                    "is_active": True,
                    "is_installed": True,
                    "status": "Ready"
                }
            ]

            for m in models_data:
                entry = ModelEntry(
                    model_id=m["model_id"],
                    name=m["name"],
                    version=m["version"],
                    architecture=m["architecture"],
                    modality=m["modality"],
                    task_type=m["task_type"],
                    dataset_name=m["dataset_name"],
                    labels=json.dumps(m["labels"]),
                    accuracy=m["accuracy"],
                    precision=m["precision"],
                    recall=m["recall"],
                    f1_score=m["f1_score"],
                    roc_auc=m["roc_auc"],
                    sensitivity=m["sensitivity"],
                    specificity=m["specificity"],
                    inference_speed_ms=m["inference_speed_ms"],
                    is_active=m["is_active"],
                    is_installed=m["is_installed"],
                    status=m["status"]
                )
                db.add(entry)
            db.commit()

        # 2. Seed Experiments
        if db.query(Experiment).count() == 0:
            exp1 = Experiment(
                experiment_id="EXP-2026-CXR-01",
                name="ResNet50 vs DenseNet121 on NIH ChestX-ray14",
                model_name="Chest Radiograph Screening Suite",
                dataset_name="NIH ChestX-ray14 (112,120 images)",
                architecture="ResNet-50 with CLAHE & Grad-CAM++",
                epochs=40,
                batch_size=32,
                learning_rate=0.0001,
                optimizer="AdamW (weight_decay=1e-4)",
                train_loss_history=json.dumps([0.68, 0.52, 0.41, 0.33, 0.28, 0.24, 0.21, 0.18, 0.16, 0.14]),
                val_loss_history=json.dumps([0.71, 0.55, 0.44, 0.36, 0.31, 0.27, 0.25, 0.22, 0.21, 0.19]),
                train_acc_history=json.dumps([0.62, 0.74, 0.81, 0.86, 0.89, 0.91, 0.93, 0.94, 0.95, 0.96]),
                val_acc_history=json.dumps([0.60, 0.71, 0.78, 0.83, 0.86, 0.89, 0.90, 0.92, 0.92, 0.93]),
                final_metrics=json.dumps({"accuracy": 0.932, "f1_score": 0.921, "roc_auc": 0.964, "sensitivity": 0.925, "specificity": 0.941}),
                notes="Integrated CLAHE contrast enhancement increased subtle ground-glass opacity recall by +4.2%.",
                status="Completed"
            )
            exp2 = Experiment(
                experiment_id="EXP-2026-RET-02",
                name="Multi-Scale Attention for Diabetic Retinopathy Grading",
                model_name="Retinal Fundus Screening Suite",
                dataset_name="EyePACS Grade 0-4 Cohort",
                architecture="ResNet-50 + Spatial Gated Attention",
                epochs=35,
                batch_size=16,
                learning_rate=0.00008,
                optimizer="AdamW",
                train_loss_history=json.dumps([0.72, 0.58, 0.46, 0.38, 0.30, 0.25, 0.20, 0.17, 0.15, 0.12]),
                val_loss_history=json.dumps([0.75, 0.61, 0.49, 0.41, 0.34, 0.29, 0.26, 0.23, 0.21, 0.19]),
                train_acc_history=json.dumps([0.58, 0.70, 0.78, 0.84, 0.88, 0.91, 0.93, 0.95, 0.96, 0.97]),
                val_acc_history=json.dumps([0.56, 0.67, 0.75, 0.81, 0.85, 0.88, 0.91, 0.93, 0.94, 0.94]),
                final_metrics=json.dumps({"accuracy": 0.945, "f1_score": 0.935, "roc_auc": 0.978, "sensitivity": 0.940, "specificity": 0.952}),
                notes="Attention heads localized microaneurysms and hard exudates with high spatial precision.",
                status="Completed"
            )
            db.add(exp1)
            db.add(exp2)
            db.commit()

        # 3. Seed Patients
        if db.query(Patient).count() == 0:
            patients = [
                Patient(reference_id="PT-2026-0881", pseudonym="Johnathan Doe", age=54, sex="Male", notes="History of progressive dyspnea and persistent non-productive cough."),
                Patient(reference_id="PT-2026-0882", pseudonym="Eleanor Vance", age=62, sex="Female", notes="Type 2 diabetes mellitus under active glycemic management. Annual retinal check."),
                Patient(reference_id="PT-2026-0883", pseudonym="Marcus Wright", age=41, sex="Male", notes="Pigmented cutaneous lesion left scapula; progressive margin alteration noted."),
                Patient(reference_id="PT-2026-0884", pseudonym="Sarah Chen", age=36, sex="Female", notes="Chronic episodic cephalalgia with transient visual aura.")
            ]
            for p in patients:
                db.add(p)
            db.commit()

        # 4. Seed Scans with pre-calculated static analysis metadata (Zero live inference during startup)
        if db.query(Scan).count() == 0:
            p_list = db.query(Patient).all()
            sample_specs = [
                {
                    "file": "sample_cxr_pneumonia.png",
                    "p_id": p_list[0].id if p_list else None,
                    "mod": "Chest X-ray",
                    "pred": "Pneumonia",
                    "conf": 0.942,
                    "risk": "High",
                    "rationale": "High confidence opacity detected in lower thoracic quadrant."
                },
                {
                    "file": "sample_cxr_normal.png",
                    "p_id": p_list[0].id if p_list else None,
                    "mod": "Chest X-ray",
                    "pred": "Normal",
                    "conf": 0.965,
                    "risk": "Low",
                    "rationale": "No focal consolidation or radiographic pathology identified."
                },
                {
                    "file": "sample_retinal_fundus.png",
                    "p_id": p_list[1].id if len(p_list) > 1 else None,
                    "mod": "Retinal Fundus",
                    "pred": "Diabetic Retinopathy",
                    "conf": 0.887,
                    "risk": "Moderate",
                    "rationale": "Microvascular anomalies detected in parafoveal retina."
                },
                {
                    "file": "sample_skin_lesion.png",
                    "p_id": p_list[2].id if len(p_list) > 2 else None,
                    "mod": "Skin Lesion",
                    "pred": "Melanoma",
                    "conf": 0.891,
                    "risk": "High",
                    "rationale": "Asymmetrical pigment network and irregular border distribution."
                },
                {
                    "file": "sample_brain_mri.png",
                    "p_id": p_list[3].id if len(p_list) > 3 else None,
                    "mod": "Brain MRI",
                    "pred": "Glioma",
                    "conf": 0.915,
                    "risk": "High",
                    "rationale": "Hyperintense mass with surrounding vasogenic edema in temporal parenchyma."
                }
            ]

            for s_spec in sample_specs:
                s_file = s_spec["file"]
                src_path = settings.SAMPLE_DIR / s_file
                scan_uid = f"SCN-{s_file.split('.')[0][-8:].upper()}"
                dest_path = settings.UPLOAD_DIR / f"{scan_uid}.png"

                if src_path.exists() and not dest_path.exists():
                    shutil.copyfile(str(src_path), str(dest_path))

                file_size = os.path.getsize(dest_path) if dest_path.exists() else 1024

                scan = Scan(
                    patient_id=s_spec["p_id"],
                    scan_uid=scan_uid,
                    file_name=f"{scan_uid}.png",
                    file_path=str(dest_path),
                    original_file_name=s_file,
                    file_size_bytes=file_size,
                    file_format="PNG",
                    detected_modality=s_spec["mod"],
                    modality_confidence=0.95,
                    quality_score=88.5,
                    quality_category="Good",
                    quality_metrics=json.dumps({"sharpness": 88.5, "noise_level": "Low", "contrast": "High"}),
                    status="Completed",
                    is_synthetic_demo=True,
                    created_at=datetime.utcnow() - timedelta(days=2)
                )
                db.add(scan)
                db.commit()
                db.refresh(scan)

                # Pre-populated static analysis record
                analysis = AnalysisResult(
                    scan_id=scan.id,
                    model_name=f"{s_spec['mod']} Screening Suite",
                    model_version="2.4.1",
                    modality=s_spec["mod"],
                    predicted_label=s_spec["pred"],
                    probability=s_spec["conf"],
                    confidence_score=s_spec["conf"],
                    uncertainty_score=round(1.0 - s_spec["conf"], 3),
                    entropy=0.18,
                    is_ood=False,
                    ood_score=0.08,
                    risk_indicator=s_spec["risk"],
                    risk_rationale=s_spec["rationale"],
                    heatmap_path=None,
                    elevation_data_path=json.dumps([]),
                    segmentation_mask_path=None,
                    measurements=json.dumps({"percentage_of_image": 11.5, "total_regions_count": 1}),
                    all_predictions=json.dumps([{"label": s_spec["pred"], "probability": s_spec["conf"]}]),
                    ensemble_agreement=json.dumps({"consensus_ratio": 0.95, "dispute_level": "Low"}),
                    inference_time_ms=65.0,
                    is_demo_mode=True,
                    safety_disclaimer="AI screening decision-support aid. Not a definitive medical diagnosis."
                )
                db.add(analysis)
                db.commit()

                if "PNEUMONIA" in scan.scan_uid or "MONIA" in scan.scan_uid:
                    rev = ReviewRecord(
                        scan_id=scan.id,
                        analysis_id=analysis.id,
                        reviewer_name="Dr. S. Clinical Radiologist",
                        reviewer_role="Lead Radiologist",
                        decision="Accepted",
                        original_label=analysis.predicted_label,
                        clinical_notes="Focal consolidation identified in the lower right lobe. Prescribed targeted antibiotic therapy.",
                        reviewed_at=datetime.utcnow()
                    )
                    db.add(rev)
                    db.commit()
