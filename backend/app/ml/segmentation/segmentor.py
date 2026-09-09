import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Dict, Any, List

class ClinicalSegmentor:
    """
    Performs Region-Of-Interest (ROI) segmentation, lesion boundary extraction,
    and morphological feature measurements.
    """

    @staticmethod
    def segment_roi(
        image_path: str,
        cam_map: np.ndarray,
        output_mask_path: str,
        threshold_ratio: float = 0.50
    ) -> Tuple[str, Dict[str, Any]]:
        orig_img = cv2.imread(image_path)
        if orig_img is None:
            pil_img = Image.open(image_path).convert("RGB")
            orig_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        h, w = orig_img.shape[:2]
        cam_resized = cv2.resize(cam_map, (w, h), interpolation=cv2.INTER_CUBIC)

        # 1. Binary mask from activation threshold
        binary_mask = (cam_resized >= threshold_ratio).astype(np.uint8) * 255

        # 2. Morphological smoothing (Closing & Opening)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        cleaned_mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel)
        cleaned_mask = cv2.morphologyEx(cleaned_mask, cv2.MORPH_OPEN, kernel)

        # 3. Contour analysis
        contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Color overlay mask
        mask_overlay = orig_img.copy()
        regions_data = []
        total_roi_area_pixels = 0

        for idx, cnt in enumerate(contours):
            area = cv2.contourArea(cnt)
            if area < (h * w * 0.005):  # Filter micro-noise
                continue
            
            total_roi_area_pixels += area
            x, y, rw, rh = cv2.boundingRect(cnt)
            perimeter = cv2.arcLength(cnt, True)
            
            # Draw contour boundary in glowing cyan/amber
            cv2.drawContours(mask_overlay, [cnt], -1, (254, 242, 0), 2)  # BGR
            # Draw bounding box
            cv2.rectangle(mask_overlay, (x, y), (x + rw, y + rh), (0, 165, 255), 1)

            regions_data.append({
                "region_id": idx + 1,
                "bounding_box": [int(x), int(y), int(rw), int(rh)],
                "area_pixels": int(area),
                "perimeter_pixels": round(float(perimeter), 1),
                "relative_area_pct": round(float(area / (h * w)) * 100.0, 2)
            })

        # Save masked visualization
        cv2.imwrite(output_mask_path, mask_overlay)

        measurements = {
            "total_regions_count": len(regions_data),
            "total_roi_area_pct": round(float(total_roi_area_pixels / (h * w)) * 100.0, 2),
            "regions": regions_data,
            "threshold_used": threshold_ratio,
            "image_dimensions": [w, h]
        }

        return output_mask_path, measurements
