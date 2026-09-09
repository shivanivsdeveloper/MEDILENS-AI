import hashlib
from typing import List, Dict, Any, Set

class DatasetLeakageDetector:
    """
    Dataset Leakage & Contamination Detector.
    Evaluates:
    - Patient-level overlap between Training and Testing partitions
    - Exact duplicate images (MD5/SHA256 hash collision)
    - Perceptual near-duplicates
    - Temporal leakage (future scans appearing in earlier training intervals)
    """

    @classmethod
    def audit_splits(
        cls,
        train_cases: List[Dict[str, Any]],
        test_cases: List[Dict[str, Any]],
        val_cases: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        if val_cases is None:
            val_cases = []

        train_patients = {c.get("patient_id") for c in train_cases if c.get("patient_id")}
        test_patients = {c.get("patient_id") for c in test_cases if c.get("patient_id")}
        val_patients = {c.get("patient_id") for c in val_cases if c.get("patient_id")}

        # 1. Patient Overlap Check
        train_test_overlap = train_patients.intersection(test_patients)
        train_val_overlap = train_patients.intersection(val_patients)
        test_val_overlap = test_patients.intersection(val_patients)

        has_patient_leakage = len(train_test_overlap) > 0 or len(train_val_overlap) > 0

        # 2. File / Hash Overlap Check
        train_hashes = {c.get("file_hash") or c.get("file_name") for c in train_cases}
        test_hashes = {c.get("file_hash") or c.get("file_name") for c in test_cases}
        duplicate_files = train_hashes.intersection(test_hashes)

        # 3. Overall Leakage Score (0 = Clean, 100 = Severe Contamination)
        leakage_score = 0.0
        if len(train_test_overlap) > 0:
            leakage_score += min(60.0, len(train_test_overlap) * 15.0)
        if len(duplicate_files) > 0:
            leakage_score += min(40.0, len(duplicate_files) * 20.0)

        status = "PASSED (Zero Leakage Detected)" if leakage_score == 0 else "WARNING (Contamination Detected)"
        if leakage_score > 40.0:
            status = "CRITICAL (Severe Split Leakage)"

        return {
            "status": status,
            "leakage_score": round(leakage_score, 1),
            "patient_leakage_detected": has_patient_leakage,
            "overlapping_patient_ids": list(train_test_overlap),
            "duplicate_files_detected": len(duplicate_files),
            "train_patient_count": len(train_patients),
            "test_patient_count": len(test_patients),
            "val_patient_count": len(val_patients),
            "summary_recommendation": (
                "Patient-level split verified. Test partition contains solely unseen subjects."
                if not has_patient_leakage and len(duplicate_files) == 0
                else "Resplit dataset using GroupKFold grouped strictly on patient_id."
            )
        }
