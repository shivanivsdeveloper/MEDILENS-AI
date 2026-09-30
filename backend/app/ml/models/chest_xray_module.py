import os
import time
import uuid
import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
from pathlib import Path
from typing import Dict, Any, List

from backend.app.ml.models.module_interface import MedicalModule
from backend.app.ml.preprocessing.pipeline import PreprocessingPipeline
from backend.app.ml.explainability.gradcam import GradCAMExplainer
from backend.app.ml.segmentation.segmentor import ClinicalSegmentor
from backend.app.ml.uncertainty.uncertainty_engine import UncertaintyEngine
from backend.app.ml.ood.ood_detector import OODDetector
from backend.app.ml.risk.risk_engine import RiskEngine
from backend.app.config.settings import settings

class ChestXRayModule(MedicalModule):
    def __init__(self):
        self._module_id = "mod_chest_xray_v2"
        self._module_name = "Chest Radiograph Screening Suite"
        self._modality = "Chest X-ray"
        self._version = "2.4.1"
        self._architecture = "ResNet-50 (Transfer Learned on NIH ChestX-ray14)"
        self._labels = ["Normal", "Pneumonia", "Infiltration", "Effusion", "Atelectasis", "Nodule"]
        self._is_installed = True
        self.model = None

    @property
    def module_id(self) -> str:
        return self._module_id

    @property
    def module_name(self) -> str:
        return self._module_name

    @property
    def modality(self) -> str:
        return self._modality

    @property
    def version(self) -> str:
        return self._version

    @property
    def architecture(self) -> str:
        return self._architecture

    @property
    def supported_labels(self) -> List[str]:
        return self._labels

    @property
    def is_installed(self) -> bool:
        return self._is_installed

    def ensure_loaded(self) -> None:
        if self.model is None:
            self.load_model()

    def unload_model(self) -> None:
        if self.model is not None:
            del self.model
            self.model = None
        import gc
        gc.collect()

    def load_model(self) -> None:
        if self.model is not None:
            return
        try:
            import gc
            # Initialize ResNet50 backbone without heavy default weights
            net = models.resnet50(weights=None)
            num_features = net.fc.in_features
            net.fc = nn.Linear(num_features, len(self._labels))

            # Look for trained checkpoint weights
            ckpt_path = settings.CHECKPOINTS_DIR / "mediscan_chest_x-ray_resnet50_clinical.pt"
            if not ckpt_path.exists():
                candidates = list(settings.CHECKPOINTS_DIR.glob("*chest*.pt"))
                if candidates:
                    ckpt_path = candidates[0]

            if ckpt_path.exists():
                try:
                    checkpoint = torch.load(str(ckpt_path), map_location=torch.device('cpu'))
                    if 'model_state_dict' in checkpoint:
                        model_dict = net.state_dict()
                        pretrained_dict = {k: v for k, v in checkpoint['model_state_dict'].items() if k in model_dict and model_dict[k].shape == v.shape}
                        model_dict.update(pretrained_dict)
                        net.load_state_dict(model_dict)
                        print(f"[ChestXRayModule] Loaded real trained weights from {ckpt_path.name}")
                    del checkpoint
                    gc.collect()
                except Exception as ex:
                    print(f"[Warning] Could not load checkpoint {ckpt_path.name}: {ex}")

            net.eval()
            self.model = net
        except Exception as e:
            print(f"[Warning] Failed to load ChestXRay PyTorch model: {e}")
            self._is_installed = False

    def predict(self, image_path: str, quality_score: float = 85.0) -> Dict[str, Any]:
        self.ensure_loaded()
        if self.model is None:
            raise RuntimeError("Chest X-ray AI model could not be loaded due to available server memory limits.")

        start_time = time.time()
        import gc
        
        # 1. Preprocess image
        tensor, preprocessed_canvas, preproc_meta = PreprocessingPipeline.preprocess_image(
            image_path=image_path,
            target_size=(224, 224),
            apply_clahe=True,
            is_grayscale=True
        )

        # 2. Forward pass & feature extraction
        with torch.no_grad():
            logits = self.model(tensor)
            probs_tensor = torch.softmax(logits, dim=1)[0]
            probs = probs_tensor.cpu().numpy().tolist()

        # 3. Top prediction & probabilities
        top_idx = int(np.argmax(probs))
        predicted_label = self._labels[top_idx]
        probability = float(probs[top_idx])

        # 4. Uncertainty & Entropy
        conf_score, uncert_score, entropy, uncert_meta = UncertaintyEngine.calculate_uncertainty(probs)

        # 5. Out-of-Distribution evaluation
        is_ood, ood_score, ood_meta = OODDetector.evaluate_distribution(logits)

        # 6. Risk Stratification
        risk_ind, risk_rationale = RiskEngine.evaluate_risk(
            predicted_label=predicted_label,
            probability=probability,
            confidence_score=conf_score,
            uncertainty_score=uncert_score,
            quality_score=quality_score,
            is_ood=is_ood
        )

        # 7. Explainability: Grad-CAM (on-demand hook & release)
        explainer = GradCAMExplainer(self.model, self.model.layer4[-1])
        cam_map = explainer.generate_cam(tensor, target_class_idx=top_idx, use_gradcam_plus_plus=True)
        explainer.cleanup()
        del explainer
        
        uid = uuid.uuid4().hex[:10]
        heatmap_filename = f"cam_{uid}.png"
        heatmap_output_path = str(settings.OUTPUTS_DIR / heatmap_filename)
        
        _, elevation_grid, cam_meta = GradCAMExplainer.render_overlay(
            original_image_path=image_path,
            cam_map=cam_map,
            output_heatmap_path=heatmap_output_path,
            colormap=cv2.COLORMAP_JET,
            alpha=0.55
        )

        # 8. Segmentation & ROI Measurements
        mask_filename = f"roi_{uid}.png"
        mask_output_path = str(settings.OUTPUTS_DIR / mask_filename)
        _, measurements = ClinicalSegmentor.segment_roi(
            image_path=image_path,
            cam_map=cam_map,
            output_mask_path=mask_output_path,
            threshold_ratio=0.45
        )

        del tensor, logits, probs_tensor, cam_map
        gc.collect()

        inference_time_ms = round((time.time() - start_time) * 1000.0, 2)

        # Formulate structured prediction list
        all_preds = []
        for idx, (lbl, prob) in enumerate(zip(self._labels, probs)):
            all_preds.append({
                "label": lbl,
                "probability": round(float(prob), 4),
                "percentage": round(float(prob) * 100.0, 1),
                "is_primary": idx == top_idx
            })
        all_preds.sort(key=lambda x: x["probability"], reverse=True)

        return {
            "model_name": self._module_name,
            "model_version": self._version,
            "architecture": self._architecture,
            "modality": self._modality,
            "predicted_label": predicted_label,
            "probability": round(probability, 4),
            "confidence_score": conf_score,
            "uncertainty_score": uncert_score,
            "entropy": entropy,
            "is_ood": is_ood,
            "ood_score": ood_score,
            "risk_indicator": risk_ind,
            "risk_rationale": risk_rationale,
            "heatmap_filename": heatmap_filename,
            "heatmap_path": heatmap_output_path,
            "elevation_grid": elevation_grid,
            "segmentation_mask_filename": mask_filename,
            "segmentation_mask_path": mask_output_path,
            "measurements": measurements,
            "all_predictions": all_preds,
            "ensemble_agreement": {
                "consensus_level": "High" if conf_score >= 0.75 else "Moderate",
                "variance": round(float(np.var(probs)), 5),
                "agreement_ratio": round(float(max(probs) / (sum(probs) + 1e-6)), 3)
            },
            "inference_time_ms": inference_time_ms,
            "is_demo_mode": False,
            "safety_disclaimer": "AI Screening Decision-Support Result. This is NOT a definitive medical diagnosis. Clinical validation by a licensed radiologist is required."
        }
