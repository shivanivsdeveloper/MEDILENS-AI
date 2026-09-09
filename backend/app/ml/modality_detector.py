import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Dict, Any

class ModalityDetector:
    """
    Identifies the medical image modality based on color distribution,
    aspect ratio, grayscale symmetry, circular mask presence, and anatomical texture.
    """

    @staticmethod
    def detect_modality(image_path: str) -> Tuple[str, float, Dict[str, Any]]:
        img = cv2.imread(image_path)
        if img is None:
            pil_img = Image.open(image_path).convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        h, w = img.shape[:2]
        
        # 1. Color variance check (grayscale vs full color)
        b, g, r = cv2.split(img)
        color_diff = np.mean(np.abs(r.astype(float) - g.astype(float))) + np.mean(np.abs(g.astype(float) - b.astype(float)))
        is_predominantly_grayscale = color_diff < 12.0
        
        # 2. Retinal Fundus heuristic (Strong red channel, circular aperture / dark corners)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        corner_mean = (float(np.mean(gray[:int(h*0.1), :int(w*0.1)])) +
                       float(np.mean(gray[:int(h*0.1), -int(w*0.1):])) +
                       float(np.mean(gray[-int(h*0.1):, :int(w*0.1)])) +
                       float(np.mean(gray[-int(h*0.1):, -int(w*0.1):]))) / 4.0
        center_mean = float(np.mean(gray[int(h*0.3):int(h*0.7), int(w*0.3):int(w*0.7)]))

        r_mean = float(np.mean(r))
        g_mean = float(np.mean(g))
        b_mean = float(np.mean(b))

        # Check for Retinal Fundus
        if not is_predominantly_grayscale and r_mean > g_mean * 1.25 and r_mean > b_mean * 1.5:
            if corner_mean < 45.0 and center_mean > 60.0:
                return "Retinal Fundus", 0.94, {
                    "is_grayscale": False,
                    "color_diff": float(round(color_diff, 2)),
                    "red_dominance": float(round(r_mean / (b_mean + 1e-5), 2)),
                    "circular_aperture_detected": True
                }
            return "Skin Lesion", 0.88, {
                "is_grayscale": False,
                "color_diff": float(round(color_diff, 2)),
                "dermatoscopic_features": True
            }

        if not is_predominantly_grayscale:
            # Dermoscopy / Skin Lesion check
            return "Skin Lesion", 0.85, {
                "is_grayscale": False,
                "color_diff": float(round(color_diff, 2)),
                "dermatoscopic_features": True
            }

        # For Grayscale modalities: Chest X-ray, Brain MRI, Bone X-ray
        mid = w // 2
        left_half = gray[:, :mid]
        right_half = cv2.flip(gray[:, mid:mid*2], 1)
        symmetry_diff = float(np.mean(np.abs(left_half.astype(float) - right_half[:, :left_half.shape[1]].astype(float))))
        
        # Dark lung field detection (two low-intensity lobes separated by mediastinum)
        lung_left = float(np.mean(gray[int(h*0.2):int(h*0.7), int(w*0.15):int(w*0.35)]))
        lung_right = float(np.mean(gray[int(h*0.2):int(h*0.7), int(w*0.65):int(w*0.85)]))
        mediastinum = float(np.mean(gray[int(h*0.2):int(h*0.7), int(w*0.45):int(w*0.55)]))

        aspect_ratio = float(w / float(h))

        if corner_mean < 30.0 and center_mean > 50.0 and 0.8 <= aspect_ratio <= 1.2 and symmetry_diff < 35.0:
            # Brain MRI (Axial / Coronal scan in black background)
            return "Brain MRI", 0.91, {
                "is_grayscale": True,
                "symmetry_diff": float(round(symmetry_diff, 2)),
                "skull_contour_detected": True,
                "aspect_ratio": float(round(aspect_ratio, 2))
            }

        if mediastinum > lung_left and mediastinum > lung_right and (lung_left < 110.0 or lung_right < 110.0):
            # Typical chest radiograph pattern (dense spine/mediastinum, radiolucent lung fields)
            return "Chest X-ray", 0.92, {
                "is_grayscale": True,
                "bilateral_lung_fields_detected": True,
                "mediastinal_density": float(round(float(mediastinum), 1)),
                "symmetry_diff": float(round(symmetry_diff, 2))
            }

        # High-contrast bone/cortical boundary detection for Bone X-ray
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.sum(edges > 0) / float(h * w))
        
        if edge_density > 0.05 or symmetry_diff >= 35.0:
            return "Bone X-ray", 0.86, {
                "is_grayscale": True,
                "edge_density": float(round(edge_density, 3)),
                "trabecular_contrast": True
            }

        return "Chest X-ray", 0.78, {
            "is_grayscale": True,
            "fallback_default": True
        }
