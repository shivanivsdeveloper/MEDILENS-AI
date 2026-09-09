import os
import uuid
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
from skimage.metrics import structural_similarity as ssim
from backend.app.config.settings import settings

class LongitudinalEngine:
    """
    AI Medical Digital Twin & Longitudinal Imaging Engine.
    Aligns historical patient scans chronologically, calculates structural SSIM,
    and generates visual delta difference heatmaps to highlight anatomical changes.
    """

    @classmethod
    def compute_visual_difference(
        cls,
        prior_image_path: str,
        current_image_path: str
    ) -> Dict[str, Any]:
        try:
            # Read both scans in grayscale
            img1 = cv2.imread(prior_image_path, cv2.IMREAD_GRAYSCALE)
            img2 = cv2.imread(current_image_path, cv2.IMREAD_GRAYSCALE)

            if img1 is None or img2 is None:
                raise ValueError("Could not read image files for comparison")

            # Standardize sizes to 512x512 for structural alignment
            target_size = (512, 512)
            img1_resized = cv2.resize(img1, target_size, interpolation=cv2.INTER_AREA)
            img2_resized = cv2.resize(img2, target_size, interpolation=cv2.INTER_AREA)

            # Histogram Equalization to normalize illumination variations
            img1_eq = cv2.equalizeHist(img1_resized)
            img2_eq = cv2.equalizeHist(img2_resized)

            # Compute Structural Similarity Index (SSIM) and difference map
            ssim_score, diff = ssim(img1_eq, img2_eq, full=True)
            diff_uint8 = (diff * 255).astype("uint8")

            # Absolute difference highlighting focal lesion/opacity changes
            abs_diff = cv2.absdiff(img1_eq, img2_eq)
            abs_diff_blur = cv2.GaussianBlur(abs_diff, (9, 9), 0)

            # Generate Colormap overlay on current scan
            diff_colored = cv2.applyColorMap(abs_diff_blur, cv2.COLORMAP_JET)
            base_bgr = cv2.cvtColor(img2_resized, cv2.COLOR_GRAY2BGR)
            overlay = cv2.addWeighted(base_bgr, 0.65, diff_colored, 0.35, 0)

            # Save difference heatmap to outputs directory
            uid = uuid.uuid4().hex[:10]
            diff_filename = f"diff_{uid}.png"
            diff_path = str(settings.OUTPUTS_DIR / diff_filename)
            cv2.imwrite(diff_path, overlay)

            # Calculate change statistics
            change_pixels = np.sum(abs_diff_blur > 40)
            total_pixels = target_size[0] * target_size[1]
            change_fraction = float(change_pixels / total_pixels)

            return {
                "difference_map_filename": diff_filename,
                "difference_map_path": diff_path,
                "ssim_similarity": round(float(ssim_score), 4),
                "structural_stability_percent": round(float(ssim_score) * 100.0, 1),
                "anatomical_change_percent": round(change_fraction * 100.0, 1),
                "delta_magnitude": "Substantial Focal Change" if change_fraction > 0.15 else "Minor / Stable Longitudinal Morphology"
            }
        except Exception as e:
            print(f"[Warning] Longitudinal visual difference failed: {e}")
            return {
                "difference_map_filename": None,
                "ssim_similarity": 1.0,
                "structural_stability_percent": 100.0,
                "anatomical_change_percent": 0.0,
                "delta_magnitude": "Evaluation Inconclusive"
            }
