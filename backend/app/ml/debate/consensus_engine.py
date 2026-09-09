import numpy as np
from typing import Dict, Any, List
from backend.app.ml.registry.model_registry import model_registry

class ModelCourtConsensusEngine:
    """
    AI Prediction Debate & Model Courtroom Consensus Engine.
    Executes multiple diagnostic models on the same case,
    evaluates inter-model agreement/disagreement, confidence variance,
    and produces a research consensus recommendation.
    """

    @classmethod
    def conduct_debate(cls, image_path: str, modality: str = "Chest X-ray") -> Dict[str, Any]:
        # Get active modules from registry
        modules = model_registry.list_modules()
        
        # Run inference across models
        court_opinions = []
        labels_voted = {}

        for mod_meta in modules:
            module_instance = model_registry.get_module_by_id(mod_meta["model_id"])
            if not module_instance or not module_instance.is_installed:
                continue
            
            try:
                pred = module_instance.predict(image_path=image_path)
                top_label = pred["predicted_label"]
                prob = pred["probability"]
                conf = pred["confidence_score"]
                uncert = pred["uncertainty_score"]
                
                court_opinions.append({
                    "model_id": mod_meta["model_id"],
                    "model_name": mod_meta["name"],
                    "architecture": mod_meta["architecture"],
                    "version": mod_meta["version"],
                    "modality": mod_meta["modality"],
                    "predicted_label": top_label,
                    "confidence": conf,
                    "uncertainty": uncert,
                    "probability": prob,
                    "risk": pred["risk_indicator"],
                    "heatmap_filename": pred.get("heatmap_filename"),
                    "key_rationale": f"Identified primary pattern '{top_label}' with {conf*100:.1f}% confidence and {uncert*100:.1f}% uncertainty index."
                })

                labels_voted[top_label] = labels_voted.get(top_label, 0) + 1
            except Exception as e:
                print(f"[Warning] Debate model execution failed for {mod_meta['model_id']}: {e}")

        if not court_opinions:
            return {
                "consensus_status": "NO_MODELS_AVAILABLE",
                "consensus_label": "N/A",
                "agreement_ratio": 0.0,
                "dispute_level": "High",
                "court_opinions": []
            }

        # Calculate consensus metrics
        total_votes = len(court_opinions)
        majority_label = max(labels_voted, key=labels_voted.get)
        majority_votes = labels_voted[majority_label]
        agreement_ratio = round(majority_votes / total_votes, 3)

        # Disagreement & Dispute Assessment
        if agreement_ratio == 1.0:
            consensus_status = "UNANIMOUS_CONSENSUS"
            dispute_level = "Zero"
            action_recommendation = "High reliability. Findings corroborating across all architectures."
        elif agreement_ratio >= 0.65:
            consensus_status = "MAJORITY_CONSENSUS"
            dispute_level = "Low"
            action_recommendation = "Standard review recommended. Minor variance in secondary model confidence."
        else:
            consensus_status = "DISAGREEMENT_DETECTED"
            dispute_level = "Critical Dispute"
            action_recommendation = "Mandatory Human Radiologist Review. Competing models disagree on primary clinical diagnosis."

        # Compute average confidence and variance
        confidences = [op["confidence"] for op in court_opinions]
        avg_confidence = round(float(np.mean(confidences)), 3)
        confidence_variance = round(float(np.var(confidences)), 4)

        return {
            "consensus_status": consensus_status,
            "consensus_label": majority_label,
            "agreement_ratio": agreement_ratio,
            "dispute_level": dispute_level,
            "total_judges": total_votes,
            "majority_votes": majority_votes,
            "average_confidence": avg_confidence,
            "confidence_variance": confidence_variance,
            "action_recommendation": action_recommendation,
            "court_opinions": court_opinions
        }
