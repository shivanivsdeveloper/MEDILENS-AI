import cv2
import numpy as np
import torch
from torchvision import transforms
from PIL import Image
from typing import Tuple, Dict, Any

class PreprocessingPipeline:
    """
    Modular clinical image preprocessing pipeline with CLAHE,
    aspect-ratio preserving padding, and multi-channel tensor conversion.
    """
    
    @staticmethod
    def preprocess_image(
        image_path: str,
        target_size: Tuple[int, int] = (224, 224),
        apply_clahe: bool = True,
        is_grayscale: bool = False
    ) -> Tuple[torch.Tensor, np.ndarray, Dict[str, Any]]:
        # 1. Load image
        img = cv2.imread(image_path)
        if img is None:
            pil_img = Image.open(image_path).convert("RGB")
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        original_h, original_w = img.shape[:2]

        # 2. Color space handling & CLAHE
        if is_grayscale or len(img.shape) == 2 or img.shape[2] == 1:
            if len(img.shape) == 3:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            else:
                gray = img
            if apply_clahe:
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                gray = clahe.apply(gray)
            rgb_processed = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
        else:
            # Color image (e.g., Retinal or Skin Lesion)
            if apply_clahe:
                lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
                l, a, b = cv2.split(lab)
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                cl = clahe.apply(l)
                limg = cv2.merge((cl, a, b))
                rgb_processed = cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)
            else:
                rgb_processed = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # 3. Aspect-ratio preserving resize with letterbox padding
        target_w, target_h = target_size
        scale = min(target_w / original_w, target_h / original_h)
        new_w = int(original_w * scale)
        new_h = int(original_h * scale)
        
        resized = cv2.resize(rgb_processed, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        # Canvas creation
        canvas = np.zeros((target_h, target_w, 3), dtype=np.uint8)
        pad_x = (target_w - new_w) // 2
        pad_y = (target_h - new_h) // 2
        canvas[pad_y:pad_y + new_h, pad_x:pad_x + new_w] = resized

        # 4. PyTorch Tensor Transformation (ImageNet normalization)
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        tensor = transform(canvas).unsqueeze(0)  # Shape: (1, 3, H, W)

        metadata = {
            "original_dimensions": [original_w, original_h],
            "target_size": list(target_size),
            "scale_factor": round(float(scale), 4),
            "padding": [pad_x, pad_y],
            "clahe_applied": apply_clahe,
            "normalized": True
        }

        return tensor, canvas, metadata
