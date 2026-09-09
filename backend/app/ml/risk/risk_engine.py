from typing import Tuple

class RiskEngine:
    """
    Deterministic clinical screening risk stratification engine combining
    predicted abnormality label, probability, uncertainty, quality, and OOD flags.
    """

    NORMAL_LABELS = {"Normal", "No Abnormality", "No Tumor", "Benign Nevus", "No DR"}

    @classmethod
    def evaluate_risk(
        cls,
        predicted_label: str,
        probability: float,
        confidence_score: float,
        uncertainty_score: float,
        quality_score: float,
        is_ood: bool
    ) -> Tuple[str, str]:
        # 1. Check for immediate review conditions
        if is_ood:
            return "Needs Review", "Out-of-distribution signature detected; input image does not conform to certified training distribution."
        
        if quality_score < 40.0:
            return "Needs Review", "Image quality is substandard; artifacts or low contrast may compromise AI feature extraction."
        
        if uncertainty_score > 0.45 or confidence_score < 0.45:
            return "Needs Review", "Elevated model uncertainty or low confidence margin; clinical manual review strongly advised."

        # 2. Risk stratification based on pathology vs normal
        is_normal = predicted_label in cls.NORMAL_LABELS

        if is_normal:
            if probability >= 0.70 and quality_score >= 60.0:
                return "Low", f"No abnormal patterns detected ({predicted_label}) with high confidence ({round(probability*100, 1)}%)."
            else:
                return "Moderate", f"Predominantly non-pathologic pattern ({predicted_label}), but moderate confidence suggests routine verification."

        # Pathological / Abnormal findings
        if probability >= 0.70:
            return "High", f"Significant abnormal feature manifestation ({predicted_label}) detected with high probability ({round(probability*100, 1)}%). Immediate specialist review recommended."
        else:
            return "Moderate", f"Abnormal pattern detected ({predicted_label}) with moderate probability ({round(probability*100, 1)}%). Secondary clinical review recommended."
