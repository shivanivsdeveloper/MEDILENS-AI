import numpy as np
from typing import List, Dict, Any, Tuple

class UncertaintyEngine:
    """
    Computes Shannon predictive entropy, ensemble variance,
    and calibrated confidence metrics.
    """

    @staticmethod
    def calculate_uncertainty(
        probabilities: List[float]
    ) -> Tuple[float, float, float, Dict[str, Any]]:
        probs = np.array(probabilities, dtype=np.float64)
        probs = np.clip(probs, 1e-7, 1.0)
        probs = probs / np.sum(probs)

        # 1. Shannon Entropy: H(p) = - sum(p * log2(p))
        num_classes = len(probs)
        max_entropy = np.log2(num_classes) if num_classes > 1 else 1.0
        entropy = -np.sum(probs * np.log2(probs))
        
        # Normalized entropy (0.0 to 1.0)
        normalized_entropy = float(np.clip(entropy / (max_entropy + 1e-7), 0.0, 1.0))

        # 2. Maximum softmax confidence
        max_prob = float(np.max(probs))
        
        # 3. Margin of confidence (difference between top 1 and top 2)
        if len(probs) > 1:
            sorted_probs = np.sort(probs)[::-1]
            margin = float(sorted_probs[0] - sorted_probs[1])
        else:
            margin = 1.0

        # Calibrated composite uncertainty score (0.0 to 1.0, where 1.0 is highest uncertainty)
        uncertainty_score = float(np.clip((normalized_entropy * 0.6) + ((1.0 - margin) * 0.4), 0.0, 1.0))
        
        # Calibrated confidence score (0.0 to 1.0, where 1.0 is highest certainty)
        confidence_score = float(np.clip(max_prob * (1.0 - (uncertainty_score * 0.4)), 0.0, 1.0))

        confidence_category = (
            "High Confidence" if confidence_score >= 0.78 else
            "Moderate Confidence" if confidence_score >= 0.55 else
            "Low Confidence / Indeterminate"
        )

        metadata = {
            "max_probability": round(max_prob, 4),
            "top2_margin": round(margin, 4),
            "shannon_entropy": round(float(entropy), 4),
            "normalized_entropy": round(normalized_entropy, 4),
            "confidence_category": confidence_category
        }

        return round(confidence_score, 4), round(uncertainty_score, 4), round(float(entropy), 4), metadata
