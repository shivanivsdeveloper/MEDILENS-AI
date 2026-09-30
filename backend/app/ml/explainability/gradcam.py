import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from pathlib import Path
from typing import Tuple, List, Dict, Any, Optional

class GradCAMExplainer:
    """
    Computes Grad-CAM and Grad-CAM++ saliency activations,
    generates thermal diagnostic overlays, and exports topographical elevation grids.
    """

    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.activations = None
        self.gradients = None
        self._forward_handle = None
        self._backward_handle = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        self._forward_handle = self.target_layer.register_forward_hook(forward_hook)
        self._backward_handle = self.target_layer.register_full_backward_hook(backward_hook)

    def cleanup(self):
        if self._forward_handle is not None:
            self._forward_handle.remove()
            self._forward_handle = None
        if self._backward_handle is not None:
            self._backward_handle.remove()
            self._backward_handle = None
        self.activations = None
        self.gradients = None
        if self.model is not None:
            self.model.zero_grad(set_to_none=True)

    def generate_cam(
        self,
        input_tensor: torch.Tensor,
        target_class_idx: Optional[int] = None,
        use_gradcam_plus_plus: bool = True
    ) -> np.ndarray:
        self.model.eval()
        self.model.zero_grad(set_to_none=True)
        
        # Ensure tensor requires gradient
        input_tensor = input_tensor.clone().detach().requires_grad_(True)
        logits = self.model(input_tensor)

        if target_class_idx is None:
            target_class_idx = int(torch.argmax(logits, dim=1).item())

        score = logits[0, target_class_idx]
        score.backward(retain_graph=False)

        if self.activations is None or self.gradients is None:
            self.cleanup()
            return np.ones((224, 224), dtype=np.float32) * 0.5

        gradients = self.gradients[0].cpu().numpy()     # Shape: (C, H, W)
        activations = self.activations[0].cpu().numpy() # Shape: (C, H, W)
        
        # Immediately release PyTorch graph references
        self.activations = None
        self.gradients = None
        self.model.zero_grad(set_to_none=True)

        if use_gradcam_plus_plus:
            # Grad-CAM++ weighting
            grad_2 = gradients ** 2
            grad_3 = gradients ** 3
            spatial_sum = np.sum(activations, axis=(1, 2), keepdims=True)
            alpha_denom = 2 * grad_2 + spatial_sum * grad_3 + 1e-7
            alpha = grad_2 / alpha_denom
            weights = np.sum(alpha * np.maximum(gradients, 0), axis=(1, 2))
            del grad_2, grad_3, spatial_sum, alpha_denom, alpha
        else:
            # Standard Grad-CAM global average pooling
            weights = np.mean(gradients, axis=(1, 2))

        # Weighted combination
        cam = np.zeros(activations.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * activations[i]

        # ReLU & Normalization
        cam = np.maximum(cam, 0)
        max_val = np.max(cam)
        if max_val > 0:
            cam = cam / max_val
        else:
            cam = np.zeros_like(cam)

        del gradients, activations, weights
        self.cleanup()
        return cam

    @staticmethod
    def render_overlay(
        original_image_path: str,
        cam_map: np.ndarray,
        output_heatmap_path: str,
        colormap: int = cv2.COLORMAP_JET,
        alpha: float = 0.55
    ) -> Tuple[str, List[List[float]], Dict[str, Any]]:
        orig_img = cv2.imread(original_image_path)
        if orig_img is None:
            pil_img = Image.open(original_image_path).convert("RGB")
            orig_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        h, w = orig_img.shape[:2]

        # Resize CAM to original image size
        cam_resized = cv2.resize(cam_map, (w, h), interpolation=cv2.INTER_CUBIC)
        cam_uint8 = np.uint8(255 * cam_resized)

        # Apply colormap
        heatmap_colored = cv2.applyColorMap(cam_uint8, colormap)

        # Blend
        blended = cv2.addWeighted(orig_img, 1.0 - alpha, heatmap_colored, alpha, 0)

        # Save heatmap overlay
        cv2.imwrite(output_heatmap_path, blended)

        # Generate low-res elevation grid (32x32) for WebGL 2.5D topographical surface
        elevation_32 = cv2.resize(cam_map, (32, 32), interpolation=cv2.INTER_AREA)
        elevation_grid = elevation_32.tolist()

        # Find peak hot-spot coordinate
        min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(cam_resized)
        
        metadata = {
            "peak_intensity": round(float(max_val), 3),
            "peak_location": [int(max_loc[0]), int(max_loc[1])],
            "colormap": "JET",
            "alpha": alpha,
            "grid_dimensions": [32, 32]
        }

        return output_heatmap_path, elevation_grid, metadata
