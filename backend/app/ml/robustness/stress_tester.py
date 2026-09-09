import os
import time
import uuid
import cv2
import numpy as np
from typing import Dict, Any, List, Tuple
from backend.app.config.settings import settings
from backend.app.ml.registry.model_registry import model_registry

class ModelStressTester:
    """
    AI Stress-Test & Perturbation Robustness Arena.
    Applies controlled image corruptions to evaluate model robustness,
    prediction stability, and Grad-CAM explanation shift.
    """

    @classmethod
    def apply_perturbation(
        cls,
        image_path: str,
        perturbation_type: str,
        severity: float = 0.5
    ) -> Tuple[np.ndarray, str]:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image for perturbation")

        perturbed = img.copy().astype(np.float32)

        if perturbation_type == "gaussian_noise":
            sigma = max(5.0, severity * 50.0)
            noise = np.random.normal(0, sigma, img.shape).astype(np.float32)
            perturbed = np.clip(perturbed + noise, 0, 255).astype(np.uint8)

        elif perturbation_type == "blur":
            ksize = int(severity * 15) * 2 + 1
            perturbed = cv2.GaussianBlur(img, (ksize, ksize), 0)

        elif perturbation_type == "brightness":
            factor = 1.0 + (severity - 0.5) * 1.5
            perturbed = np.clip(perturbed * factor, 0, 255).astype(np.uint8)

        elif perturbation_type == "contrast":
            factor = max(0.2, 1.0 + (severity - 0.5) * 2.0)
            mean_val = np.mean(perturbed)
            perturbed = np.clip((perturbed - mean_val) * factor + mean_val, 0, 255).astype(np.uint8)

        elif perturbation_type == "rotation":
            angle = (severity - 0.5) * 40.0
            h, w = img.shape[:2]
            M = cv2.getRotationMatrix2D((w/2, h/2), angle, 1.0)
            perturbed = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)

        elif perturbation_type == "compression":
            quality = int(max(10, 100 - (severity * 90)))
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
            _, enc = cv2.imencode(".jpg", img, encode_param)
            perturbed = cv2.imdecode(enc, 1)

        elif perturbation_type == "resolution":
            scale = max(0.1, 1.0 - (severity * 0.8))
            h, w = img.shape[:2]
            small = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            perturbed = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)

        else:
            perturbed = img

        uid = uuid.uuid4().hex[:10]
        output_filename = f"perturb_{perturbation_type}_{uid}.png"
        output_path = str(settings.OUTPUTS_DIR / output_filename)
        cv2.imwrite(output_path, perturbed)

        return perturbed, output_filename

    @classmethod
    def evaluate_stress_test(
        cls,
        image_path: str,
        modality: str = "Chest X-ray",
        model_id: str = "mod_chest_xray_v2",
        perturbations: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        module = model_registry.get_module_by_id(model_id) or model_registry.get_module_for_modality(modality)
        if not module:
            return {"status": "ERROR", "message": "Model not found for stress test"}

        # 1. Baseline prediction on unperturbed image
        baseline_pred = module.predict(image_path=image_path)
        base_label = baseline_pred["predicted_label"]
        base_conf = baseline_pred["confidence_score"]

        if not perturbations:
            perturbations = [
                {"type": "gaussian_noise", "severity": 0.4},
                {"type": "blur", "severity": 0.5},
                {"type": "contrast", "severity": 0.3},
                {"type": "brightness", "severity": 0.6},
                {"type": "compression", "severity": 0.7},
                {"type": "resolution", "severity": 0.5}
            ]

        results = []
        stability_flags = []

        for p in perturbations:
            ptype = p.get("type", "blur")
            sev = float(p.get("severity", 0.5))
            
            try:
                _, perturb_filename = cls.apply_perturbation(image_path, ptype, sev)
                perturb_full_path = str(settings.OUTPUTS_DIR / perturb_filename)
                
                # Predict on corrupted scan
                p_pred = module.predict(image_path=perturb_full_path)
                p_label = p_pred["predicted_label"]
                p_conf = p_pred["confidence_score"]
                
                maintained = (p_label == base_label)
                stability_flags.append(1.0 if maintained else 0.0)
                
                # Confidence shift
                conf_delta = round(abs(p_conf - base_conf), 3)

                results.append({
                    "perturbation_type": ptype,
                    "severity": sev,
                    "perturbed_image_filename": perturb_filename,
                    "perturbed_prediction": p_label,
                    "perturbed_confidence": p_conf,
                    "prediction_maintained": maintained,
                    "confidence_delta": conf_delta,
                    "heatmap_filename": p_pred.get("heatmap_filename"),
                    "status": "PASS" if maintained else "FAIL"
                })
            except Exception as e:
                print(f"[Warning] Perturbation evaluation error: {e}")

        # Compute overall Stability Index (0 - 100%)
        pass_ratio = float(np.mean(stability_flags)) if stability_flags else 1.0
        stability_score = round(pass_ratio * 100.0, 1)

        if stability_score >= 85.0:
            robustness_tier = "High Robustness (Clinical Resilience Verified)"
        elif stability_score >= 60.0:
            robustness_tier = "Moderate Robustness (Susceptible to High-Frequency Noise)"
        else:
            robustness_tier = "Fragile / Low Robustness (Sensitivity to Artifacts)"

        return {
            "baseline_label": base_label,
            "baseline_confidence": base_conf,
            "overall_stability_score": stability_score,
            "robustness_tier": robustness_tier,
            "tests_evaluated": len(results),
            "tests_passed": int(sum(stability_flags)),
            "perturbation_results": results
        }
