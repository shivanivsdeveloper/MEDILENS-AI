import numpy as np
from typing import List, Dict, Any

class SimilarCaseRetrievalEngine:
    """
    High-performance vector cosine similarity search across historical case memory.
    Retrieves nearest neighbor cases with similarity scores, visual overlays,
    and metadata for research pattern comparison.
    """

    @classmethod
    def find_top_k_similar(
        cls,
        query_vector: List[float],
        candidate_cases: List[Dict[str, Any]],
        top_k: int = 4
    ) -> List[Dict[str, Any]]:
        if not query_vector or not candidate_cases:
            return []

        q_vec = np.array(query_vector, dtype=np.float32)
        norm_q = np.linalg.norm(q_vec)
        if norm_q > 0:
            q_vec = q_vec / norm_q

        scored_cases = []
        for case in candidate_cases:
            vec = case.get("embedding_vector")
            if not vec:
                continue
            
            c_vec = np.array(vec, dtype=np.float32)
            norm_c = np.linalg.norm(c_vec)
            if norm_c > 0:
                c_vec = c_vec / norm_c

            # Cosine similarity in range [-1, 1] mapped to [0, 1]
            similarity = float(np.dot(q_vec, c_vec))
            similarity_percent = max(0.0, min(100.0, ((similarity + 1.0) / 2.0) * 100.0))

            scored_cases.append({
                "scan_id": case.get("scan_id"),
                "patient_id": case.get("patient_id"),
                "scan_uid": case.get("scan_uid"),
                "file_name": case.get("file_name"),
                "modality": case.get("modality", "Chest X-ray"),
                "diagnosis": case.get("diagnosis", "Unconfirmed"),
                "confidence": case.get("confidence", 0.0),
                "similarity_score": round(similarity, 4),
                "similarity_percentage": round(similarity_percent, 1),
                "heatmap_filename": case.get("heatmap_filename"),
                "clinical_notes": case.get("clinical_notes", "Historical case record"),
                "category_label": "High Visual Congruence" if similarity_percent >= 85 else "Moderate Visual Alignment"
            })

        scored_cases.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_cases[:top_k]
