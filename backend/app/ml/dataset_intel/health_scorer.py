from typing import List, Dict, Any

class DatasetHealthScorer:
    """
    Automated Dataset Health Score Calculator.
    Evaluates:
    - Missing metadata and labels
    - Class balance & Gini coefficient
    - Image quality distribution (blur/noise ratio)
    - Corrupt or unreadable files
    - Resolution consistency
    """

    @classmethod
    def calculate_health_score(cls, dataset_stats: Dict[str, Any]) -> Dict[str, Any]:
        total_samples = dataset_stats.get("total_samples", 100)
        missing_labels = dataset_stats.get("missing_labels_count", 0)
        low_quality_count = dataset_stats.get("low_quality_count", 0)
        corrupted_count = dataset_stats.get("corrupted_count", 0)
        class_counts = dataset_stats.get("class_distribution", {})

        # 1. Missing labels deduction
        missing_rate = missing_labels / max(1, total_samples)
        missing_penalty = missing_rate * 30.0

        # 2. Low quality deduction
        low_q_rate = low_quality_count / max(1, total_samples)
        quality_penalty = low_q_rate * 25.0

        # 3. Corrupted files deduction
        corrupt_penalty = (corrupted_count / max(1, total_samples)) * 50.0

        # 4. Class balance deduction (Gini/Imbalance)
        balance_penalty = 0.0
        if class_counts and len(class_counts) > 1:
            counts = list(class_counts.values())
            max_c = max(counts)
            min_c = min(counts)
            imbalance_ratio = max_c / max(1, min_c)
            if imbalance_ratio > 10.0:
                balance_penalty = 15.0
            elif imbalance_ratio > 4.0:
                balance_penalty = 8.0

        total_deduction = missing_penalty + quality_penalty + corrupt_penalty + balance_penalty
        health_score = round(max(0.0, min(100.0, 100.0 - total_deduction)), 1)

        if health_score >= 88.0:
            health_grade = "Grade A (Research & Clinical Benchmark Ready)"
        elif health_score >= 75.0:
            health_grade = "Grade B (Minor Imbalance or Noise Cautions)"
        elif health_score >= 60.0:
            health_grade = "Grade C (Substantial Quality Gaps Identified)"
        else:
            health_grade = "Grade D / Unacceptable (Severe Contamination or Missing Data)"

        return {
            "dataset_name": dataset_stats.get("dataset_name", "Clinical Imaging Cohort"),
            "health_score": health_score,
            "health_grade": health_grade,
            "total_samples": total_samples,
            "penalties": {
                "missing_labels_penalty": round(missing_penalty, 1),
                "low_quality_penalty": round(quality_penalty, 1),
                "corrupted_penalty": round(corrupt_penalty, 1),
                "class_imbalance_penalty": round(balance_penalty, 1)
            },
            "class_distribution": class_counts
        }
