# System Limitations & Clinical Disclaimers

---

## 1. Academic & Decision-Support Scope
- MediScan AI is engineered as an **academic, research, and clinical decision-support prototype**.
- It is **NOT certified as a primary diagnostic medical device** by the FDA, CE, or equivalent regulatory bodies.

---

## 2. Model & Data Constraints
- **Sub-optimal Images**: While the Image Quality Engine flags blur, clipping, and artifacts, severe distortions may still influence deep feature representations.
- **Out-of-Distribution Inputs**: Modalities or anatomical variations not present in training cohorts may yield elevated entropy and will be flagged for mandatory clinical review.
- **Biopsy Correlation**: In dermatological and neuro-oncology cases, definitive diagnoses require histopathological biopsy confirmation rather than image screening alone.

---

## 3. Human Clinical Review Requirement
- Every screening indication produced by MediScan AI must be reviewed and countersigned by a qualified, licensed healthcare professional prior to clinical intervention.
