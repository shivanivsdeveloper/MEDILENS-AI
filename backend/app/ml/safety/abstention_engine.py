from typing import Dict, Any, List, Tuple

class AIAbstentionEngine:
    """
    AI Abstention & Red-Flag Safety Engine.
    Evaluates whether the automated system is permitted to provide a diagnostic
    screening prediction or MUST ABSTAIN to prevent AI hallucination and patient harm.
    """

    QUALITY_THRESHOLD_MIN = 50.0
    UNCERTAINTY_THRESHOLD_MAX = 0.42
    CONFIDENCE_THRESHOLD_MIN = 0.60
    ENTROPY_THRESHOLD_MAX = 1.65

    @classmethod
    def evaluate_safety_and_abstention(
        cls,
        quality_score: float,
        confidence_score: float,
        uncertainty_score: float,
        entropy: float,
        is_ood: bool,
        ood_score: float,
        model_agreement_ratio: float = 1.0,
        modality_supported: bool = True
    ) -> Dict[str, Any]:
        red_flags = []
        checks_passed = []

        # 1. Modality Compatibility Check
        if not modality_supported:
            red_flags.append({
                "rule": "UNSUPPORTED_MODALITY",
                "severity": "CRITICAL",
                "message": "Input scan does not match any clinically calibrated neural network modality."
            })
        else:
            checks_passed.append("Modality Verification")

        # 2. Image Quality Gatekeeper Check
        if quality_score < cls.QUALITY_THRESHOLD_MIN:
            red_flags.append({
                "rule": "POOR_IMAGE_QUALITY",
                "severity": "HIGH",
                "message": f"Scan quality score ({quality_score:.1f}/100) is below clinical diagnostic threshold (>=50.0). Excessive blur or noise detected."
            })
        else:
            checks_passed.append("Image Quality Gatekeeper")

        # 3. Out-Of-Distribution (OOD) Check
        if is_ood and ood_score > 0.70:
            red_flags.append({
                "rule": "OUT_OF_DISTRIBUTION",
                "severity": "HIGH",
                "message": f"Feature embedding distance ({ood_score:.2f}) indicates an unfamiliar or atypical anatomical representation not adequately represented in training distribution."
            })
        else:
            checks_passed.append("Distribution Space Verification")

        # 4. Uncertainty & Entropy Check
        if uncertainty_score > cls.UNCERTAINTY_THRESHOLD_MAX or entropy > cls.ENTROPY_THRESHOLD_MAX:
            red_flags.append({
                "rule": "HIGH_PREDICTIVE_UNCERTAINTY",
                "severity": "HIGH",
                "message": f"Predictive uncertainty ({uncertainty_score:.2f}) / Entropy ({entropy:.2f}) exceeds safety boundary. Model outputs are highly dispersed."
            })
        else:
            checks_passed.append("Uncertainty Bounds Verification")

        # 5. Inter-Model Agreement Check
        if model_agreement_ratio < 0.60:
            red_flags.append({
                "rule": "INTER_MODEL_DISAGREEMENT",
                "severity": "MEDIUM",
                "message": f"Ensemble agreement ({model_agreement_ratio*100:.0f}%) indicates disagreement across independent diagnostic backbones."
            })
        else:
            checks_passed.append("Ensemble Consensus Verification")

        # Determine Abstention Decision
        should_abstain = len([rf for rf in red_flags if rf["severity"] in ("CRITICAL", "HIGH")]) > 0

        if should_abstain:
            ai_state = "ABSTENTION_ENFORCED"
            status_summary = "AI Automated Screening Abstained. Reliable automated screening could not be established."
            action_prompt = "Case routed to Priority Human Radiologist Review Queue."
        elif len(red_flags) > 0:
            ai_state = "RESULT_WITH_WARNING"
            status_summary = "Screening Available with Safety Cautions."
            action_prompt = "Review evidence regions and calibration prior to sign-off."
        else:
            ai_state = "NOMINAL_PASSED"
            status_summary = "All 5 Safety Red-Flag Verification Gates Passed."
            action_prompt = "Standard clinical decision-support workflow active."

        return {
            "should_abstain": should_abstain,
            "ai_state": ai_state,
            "status_summary": status_summary,
            "action_prompt": action_prompt,
            "red_flags": red_flags,
            "checks_passed": checks_passed,
            "safety_score": round(max(0.0, 100.0 - (len(red_flags) * 22.0)), 1)
        }
