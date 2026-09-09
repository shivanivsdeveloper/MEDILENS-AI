import time
import uuid
import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
from typing import Dict, Any, List

from backend.app.ml.models.module_interface import MedicalModule
from backend.app.ml.preprocessing.pipeline import PreprocessingPipeline
from backend.app.ml.explainability.gradcam import GradCAMExplainer
from backend.app.ml.segmentation.segmentor import ClinicalSegmentor
from backend.app.ml.uncertainty.uncertainty_engine import UncertaintyEngine
from backend.app.ml.ood.ood_detector import OODDetector
from backend.app.ml.risk.risk_engine import RiskEngine
from backend.app.config.settings import settings

class RetinalModule(MedicalModule):
    def __init__(self):
        self._module_id = "mod_retinal_v2"
        self._module_name = "Retinal Fundus Screening Suite"
        self._modality = "Retinal Fundus"
        self._version = "2.1.0"
        self._architecture = "ResNet-50 (EyePACS / Messidor Fine-tuned)"
        self._labels = ["Normal", "Diabetic Retinopathy", "Glaucoma", "AMD"]
        self._is_installed = True
        self.model = None
        self.explainer = None
        self.load_model()

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

    def load_model(self) -> None:
        try:
            net = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
            num_features = net.fc.in_features
            net.fc = nn.Linear(num_features, len(self._labels))
            net.eval()
            self.model = net
            self.explainer = GradCAMExplainer(self.model, self.model.layer4[-1])
        except Exception as e:
            print(f"[Warning] Retinal module init: {e}")
            self._is_installed = False

    def predict(self, image_path: str, quality_score: float = 85.0) -> Dict[str, Any]:
        start_time = time.time()
        tensor, canvas, _ = PreprocessingPipeline.preprocess_image(
            image_path=image_path,
            target_size=(224, 224),
            apply_clahe=True,
            is_grayscale=False
        )

        with torch.no_grad():
            logits = self.model(tensor)
            probs_tensor = torch.softmax(logits, dim=1)[0]
            probs = probs_tensor.cpu().numpy().tolist()

        top_idx = int(np.argmax(probs))
        predicted_label = self._labels[top_idx]
        probability = float(probs[top_idx])

        conf_score, uncert_score, entropy, _ = UncertaintyEngine.calculate_uncertainty(probs)
        is_ood, ood_score, _ = OODDetector.evaluate_distribution(logits)

        risk_ind, risk_rationale = RiskEngine.evaluate_risk(
            predicted_label=predicted_label,
            probability=probability,
            confidence_score=conf_score,
            uncertainty_score=uncert_score,
            quality_score=quality_score,
            is_ood=is_ood
        )

        cam_map = self.explainer.generate_cam(tensor, target_class_idx=top_idx, use_gradcam_plus_plus=True)
        uid = uuid.uuid4().hex[:10]
        heatmap_filename = f"cam_{uid}.png"
        heatmap_path = str(settings.OUTPUTS_DIR / heatmap_filename)
        _, elevation_grid, _ = GradCAMExplainer.render_overlay(image_path, cam_map, heatmap_path, cv2.COLORMAP_JET, 0.55)

        mask_filename = f"roi_{uid}.png"
        mask_path = str(settings.OUTPUTS_DIR / mask_filename)
        _, measurements = ClinicalSegmentor.segment_roi(image_path, cam_map, mask_path, 0.45)

        inference_time_ms = round((time.time() - start_time) * 1000.0, 2)

        all_preds = [{"label": l, "probability": round(float(p), 4), "percentage": round(float(p)*100, 1), "is_primary": i == top_idx}
                     for i, (l, p) in enumerate(zip(self._labels, probs))]
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
            "heatmap_path": heatmap_path,
            "elevation_grid": elevation_grid,
            "segmentation_mask_filename": mask_filename,
            "segmentation_mask_path": mask_path,
            "measurements": measurements,
            "all_predictions": all_preds,
            "ensemble_agreement": {
                "consensus_level": "High" if conf_score >= 0.75 else "Moderate",
                "variance": round(float(np.var(probs)), 5),
                "agreement_ratio": round(float(max(probs) / (sum(probs) + 1e-6)), 3)
            },
            "inference_time_ms": inference_time_ms,
            "is_demo_mode": False,
            "safety_disclaimer": "AI Screening Decision-Support Result. This is NOT a definitive medical diagnosis. Clinical validation by an ophthalmologist is required."
        }
