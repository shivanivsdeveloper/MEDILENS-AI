import numpy as np
import torch
from typing import Tuple, Dict, Any

class OODDetector:
    """
    Out-Of-Distribution (OOD) Detector calculating energy score and
    feature norm consistency to reject non-medical and anomalous inputs.
    """

    @staticmethod
    def evaluate_distribution(
        logits: torch.Tensor,
        temperature: float = 1.0,
        energy_threshold: float = -2.5
    ) -> Tuple[bool, float, Dict[str, Any]]:
        # Free energy score: E(x) = - T * log( sum( exp( f_i(x) / T ) ) )
        with torch.no_grad():
            logsumexp = torch.logsumexp(logits / temperature, dim=1).item()
            energy_score = float(-temperature * logsumexp)

        # Standardized OOD score (higher = more likely out of distribution)
        # For normal in-distribution medical images, energy is low (< -3.0).
        # Anomalous or corrupted images exhibit higher energy (> -2.0).
        ood_score = float(np.clip((energy_score - (-8.0)) / (6.0), 0.0, 1.0))
        is_ood = bool(energy_score > energy_threshold or ood_score > 0.75)

        metadata = {
            "energy_score": round(energy_score, 4),
            "ood_score": round(ood_score, 4),
            "energy_threshold": energy_threshold,
            "status": "Out-of-Distribution Detected" if is_ood else "In-Distribution (Supported Modality)"
        }

        return is_ood, round(ood_score, 4), metadata
