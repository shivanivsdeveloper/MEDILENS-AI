import os
import shutil
import cv2
import json
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.app.config.settings import settings
from backend.app.models.entities import Patient, Scan, AnalysisResult, ModelEntry, Experiment, ReviewRecord, AuditLog
from backend.app.ml.preprocessing.quality_engine import ImageQualityEngine
from backend.app.ml.modality_detector import ModalityDetector
from backend.app.ml.registry.model_registry import model_registry

from backend.app.services.auth_service import AuthService

class SeedService:
    @staticmethod
    def create_sample_images():
        """
        Creates synthetic radiographic patterns for out-of-the-box exploration.
        """
        sample_dir = settings.SAMPLE_DIR
        sample_dir.mkdir(parents=True, exist_ok=True)

        # 1. Chest X-Ray Normal
        cxr_normal_path = sample_dir / "sample_cxr_normal.png"
        if not cxr_normal_path.exists():
            img = np.zeros((512, 512, 3), dtype=np.uint8)
            # Background thorax gradient
            y, x = np.ogrid[:512, :512]
            thorax = np.exp(-((x - 256)**2 / 35000 + (y - 256)**2 / 45000))
            gray = np.uint8(thorax * 180)
            
            # Left & Right lung dark cavities
            lung_l = np.exp(-((x - 170)**2 / 4500 + (y - 240)**2 / 12000))
            lung_r = np.exp(-((x - 342)**2 / 4500 + (y - 240)**2 / 12000))
            gray = np.uint8(np.clip(gray - (lung_l * 120) - (lung_r * 120), 10, 240))
            
            # Rib cage arcs
            for r_y in range(120, 420, 45):
                cv2.ellipse(gray, (256, r_y), (180, 40), 0, 0, 180, 140, 2)
            
            # Spine & mediastinum
            cv2.line(gray, (256, 60), (256, 480), 200, 18)
            # Heart shadow
            cv2.ellipse(gray, (290, 280), (60, 45), 30, 0, 360, 175, -1)
            
            blurred = cv2.GaussianBlur(gray, (7, 7), 0)
            cv2.imwrite(str(cxr_normal_path), cv2.cvtColor(blurred, cv2.COLOR_GRAY2BGR))

        # 2. Chest X-Ray Infiltration / Pneumonia
        cxr_pneumonia_path = sample_dir / "sample_cxr_pneumonia.png"
        if not cxr_pneumonia_path.exists():
            base_img = cv2.imread(str(cxr_normal_path), cv2.IMREAD_GRAYSCALE)
            # Add focal dense opacity in right lower lobe
            y, x = np.ogrid[:512, :512]
            focal_opacity = np.exp(-((x - 180)**2 / 1800 + (y - 300)**2 / 2400))
            dense_gray = np.uint8(np.clip(base_img + (focal_opacity * 130), 0, 255))
            cv2.imwrite(str(cxr_pneumonia_path), cv2.cvtColor(dense_gray, cv2.COLOR_GRAY2BGR))

        # 3. Retinal Fundus Image
        retinal_path = sample_dir / "sample_retinal_fundus.png"
        if not retinal_path.exists():
            img = np.zeros((512, 512, 3), dtype=np.uint8)
            # Circular fundus aperture
            cv2.circle(img, (256, 256), 235, (30, 60, 200), -1)  # BGR: Red/Orange base
            # Macula (dark central spot)
            cv2.circle(img, (290, 256), 28, (15, 35, 140), -1)
            # Optic Disc (bright yellowish disc)
            cv2.circle(img, (180, 256), 34, (80, 200, 245), -1)
            # Vascular branch arcades
            for angle in [0.3, 0.8, -0.4, -0.9]:
                cv2.ellipse(img, (180, 256), (120, 70), angle * 50, 0, 140, (15, 25, 110), 3)
            # Subtle exudate lesions
            cv2.circle(img, (320, 220), 6, (120, 240, 255), -1)
            cv2.circle(img, (340, 235), 4, (120, 240, 255), -1)
            cv2.imwrite(str(retinal_path), img)

        # 4. Skin Lesion (Dermoscopy)
        skin_path = sample_dir / "sample_skin_lesion.png"
        if not skin_path.exists():
            img = np.ones((512, 512, 3), dtype=np.uint8) * 190
            img[:, :, 2] = 220  # Peach skin tone
            img[:, :, 0] = 160
            # Asymmetrical atypical melanocytic pigment network
            cv2.ellipse(img, (256, 256), (110, 85), 25, 0, 360, (40, 50, 80), -1)
            cv2.ellipse(img, (270, 240), (55, 45), -15, 0, 360, (20, 25, 40), -1)
            # Blur boundaries
            img = cv2.GaussianBlur(img, (15, 15), 0)
            cv2.imwrite(str(skin_path), img)

        # 5. Brain MRI Axial Slice
        brain_path = sample_dir / "sample_brain_mri.png"
        if not brain_path.exists():
            img = np.zeros((512, 512), dtype=np.uint8)
            # Skull contour
            cv2.ellipse(img, (256, 256), (190, 220), 0, 0, 360, 210, 8)
            # Brain parenchyma
            cv2.ellipse(img, (256, 256), (175, 205), 0, 0, 360, 120, -1)
            # Bilateral ventricles
            cv2.ellipse(img, (235, 250), (16, 50), -10, 0, 360, 20, -1)
            cv2.ellipse(img, (277, 250), (16, 50), 10, 0, 360, 20, -1)
            # Glioma hyperintensity region in temporal lobe
            cv2.circle(img, (340, 270), 30, 230, -1)
            img = cv2.GaussianBlur(img, (5, 5), 0)
            cv2.imwrite(str(brain_path), cv2.cvtColor(img, cv2.COLOR_GRAY2BGR))

    @staticmethod
    def seed_initial_data(db: Session):
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

        # 4. Ingest Sample Scans if Scans table is empty
        if db.query(Scan).count() == 0:
            p_list = db.query(Patient).all()
            sample_files = [
                ("sample_cxr_pneumonia.png", p_list[0].id if p_list else None, "Chest X-ray"),
                ("sample_cxr_normal.png", p_list[0].id if p_list else None, "Chest X-ray"),
                ("sample_retinal_fundus.png", p_list[1].id if len(p_list) > 1 else None, "Retinal Fundus"),
                ("sample_skin_lesion.png", p_list[2].id if len(p_list) > 2 else None, "Skin Lesion"),
                ("sample_brain_mri.png", p_list[3].id if len(p_list) > 3 else None, "Brain MRI")
            ]

            for s_file, p_id, mod in sample_files:
                src_path = settings.SAMPLE_DIR / s_file
                if not src_path.exists():
                    continue

                scan_uid = f"SCN-{s_file.split('.')[0][-8:].upper()}"
                dest_path = settings.UPLOAD_DIR / f"{scan_uid}.png"
                shutil.copyfile(str(src_path), str(dest_path))

                q_score, q_cat, q_meta = ImageQualityEngine.assess_quality(str(dest_path))
                det_mod, mod_conf, mod_meta = ModalityDetector.detect_modality(str(dest_path))

                scan = Scan(
                    patient_id=p_id,
                    scan_uid=scan_uid,
                    file_name=f"{scan_uid}.png",
                    file_path=str(dest_path),
                    original_file_name=s_file,
                    file_size_bytes=os.path.getsize(dest_path),
                    file_format="PNG",
                    detected_modality=mod,
                    modality_confidence=mod_conf,
                    quality_score=q_score,
                    quality_category=q_cat,
                    quality_metrics=json.dumps(q_meta),
                    status="Uploaded",
                    is_synthetic_demo=True,
                    created_at=datetime.utcnow() - timedelta(days=np.random.randint(0, 5), hours=np.random.randint(1, 12))
                )
                db.add(scan)
                db.commit()
                db.refresh(scan)

                # Run initial AI inference on seed scans
                module = model_registry.get_module_for_modality(scan.detected_modality)
                if module:
                    pred_dict = module.predict(scan.file_path, quality_score=scan.quality_score)
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

                    # Add Seed Review Record for some scans
                    if scan.scan_uid.endswith("MONIA"):
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
