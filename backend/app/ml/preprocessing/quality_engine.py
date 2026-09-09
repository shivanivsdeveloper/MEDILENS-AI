import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple

class ImageQualityEngine:
    """
    Assesses clinical image quality based on sharpness, contrast, exposure,
    signal-to-noise ratio (SNR), and resolution adequacy.
    """
    
    @staticmethod
    def assess_quality(image_path: str) -> Tuple[float, str, Dict[str, Any]]:
        # Load image via OpenCV
        img = cv2.imread(image_path)
        if img is None:
            # Fallback to PIL for non-standard formats
            try:
                pil_img = Image.open(image_path).convert("RGB")
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception:
                return 0.0, "Critical Failure", {
                    "sharpness_score": 0.0,
                    "contrast_score": 0.0,
                    "exposure_score": 0.0,
                    "snr_score": 0.0,
                    "resolution_score": 0.0,
                    "blur_detected": True,
                    "under_exposed": False,
                    "over_exposed": False,
                    "aspect_ratio": 1.0,
                    "dimensions": [0, 0],
                    "status_summary": "Unreadable image file or corrupt encoding."
                }

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # 1. Sharpness / Blur estimation via Laplacian variance
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        # Normal range ~ 100 - 1500+
        sharpness_score = float(np.clip((laplacian_var / 500.0) * 100.0, 10.0, 100.0))
        blur_detected = laplacian_var < 80.0

        # 2. Contrast estimation via RMS contrast and Michelson contrast
        mean_intensity = float(np.mean(gray))
        std_intensity = float(np.std(gray))
        # RMS contrast normalized
        rms_contrast = std_intensity / (mean_intensity + 1e-5)
        contrast_score = float(np.clip(rms_contrast * 160.0, 15.0, 100.0))

        # 3. Exposure estimation (checking histogram bounds for clipping)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
        total_pixels = float(h * w)
        dark_pixels_ratio = float(np.sum(hist[:15]) / total_pixels)
        bright_pixels_ratio = float(np.sum(hist[240:]) / total_pixels)
        
        under_exposed = dark_pixels_ratio > 0.45
        over_exposed = bright_pixels_ratio > 0.35
        exposure_penalty = (dark_pixels_ratio * 30.0) + (bright_pixels_ratio * 40.0)
        exposure_score = float(np.clip(100.0 - exposure_penalty, 20.0, 100.0))

        # 4. Signal-to-Noise Ratio (SNR)
        noise_sigma = float(np.std(gray - cv2.GaussianBlur(gray, (5, 5), 0)))
        snr = mean_intensity / (noise_sigma + 1e-5)
        snr_score = float(np.clip(snr * 8.0, 20.0, 100.0))

        # 5. Resolution score
        min_dim = min(h, w)
        if min_dim >= 1024:
            resolution_score = 100.0
        elif min_dim >= 512:
            resolution_score = 90.0
        elif min_dim >= 256:
            resolution_score = 75.0
        elif min_dim >= 128:
            resolution_score = 50.0
        else:
            resolution_score = 25.0

        # Overall composite score (Weighted sum)
        composite_score = (
            sharpness_score * 0.30 +
            contrast_score * 0.25 +
            exposure_score * 0.20 +
            snr_score * 0.15 +
            resolution_score * 0.10
        )
        composite_score = float(round(np.clip(composite_score, 10.0, 99.0), 1))

        # Category classification
        if composite_score >= 85.0:
            category = "Optimal Quality"
            summary = "High diagnostic fidelity; optimal for AI feature screening."
        elif composite_score >= 65.0:
            category = "Acceptable Quality"
            summary = "Suitable for screening. Minimal noise or compression detected."
        elif composite_score >= 45.0:
            category = "Sub-Optimal Quality"
            summary = "Image quality may affect AI reliability. Moderate blur or clipping."
        else:
            category = "Unsatisfactory Quality"
            summary = "Significant distortion, low contrast, or severe blur. Re-acquisition advised."

        metrics = {
            "sharpness_score": float(round(sharpness_score, 1)),
            "contrast_score": float(round(contrast_score, 1)),
            "exposure_score": float(round(exposure_score, 1)),
            "snr_score": float(round(snr_score, 1)),
            "resolution_score": float(round(resolution_score, 1)),
            "blur_detected": bool(blur_detected),
            "under_exposed": bool(under_exposed),
            "over_exposed": bool(over_exposed),
            "aspect_ratio": float(round(w / float(h), 2)),
            "dimensions": [int(w), int(h)],
            "status_summary": str(summary)
        }

        return composite_score, category, metrics
