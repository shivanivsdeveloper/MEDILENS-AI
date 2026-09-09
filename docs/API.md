# MediScan AI — REST API Documentation

Base URL: `http://localhost:8000/api`

---

## 1. System Health & Telemetry
- `GET /health`
  - Returns platform version, GPU compute availability, database status, and storage utilization.

---

## 2. Radiograph Ingestion & Inference
- `POST /scans/upload`
  - Multipart file upload (`file: UploadFile`, `patient_id: Optional[int]`, `auto_analyze: bool = True`).
  - Returns `ScanResponse` with quality score, detected modality, and analysis results.

- `POST /scans/batch-upload`
  - Multi-file radiograph ingestion.

- `GET /scans`
  - Query parameters: `modality`, `risk`, `patient_id`, `skip`, `limit`.
  - Returns array of `ScanResponse`.

- `GET /scans/{scan_id}`
  - Returns complete scan metadata, quality scorecard, Grad-CAM elevation grid, and ROI measurements.

- `POST /scans/{scan_id}/analyze`
  - Triggers on-demand re-analysis with optional `model_id`.

- `GET /scans/{scan_id}/report`
  - Generates and streams ReportLab PDF clinical screening report.

- `DELETE /scans/{scan_id}`
  - Deletes scan record and associated artifacts.

---

## 3. Patient Management
- `GET /patients`: List registered patients.
- `POST /patients`: Create patient profile (`reference_id`, `pseudonym`, `age`, `sex`, `notes`).
- `GET /patients/{id}`: Retrieve patient dossier with complete longitudinal scan timeline.

---

## 4. Clinical Review Queue & HITL Feedback
- `GET /reviews/queue`: List pending, reviewed, and escalated cases.
- `POST /reviews`: Submit clinician sign-off (`decision`, `reviewer_name`, `corrected_label`, `clinical_notes`).
- `GET /reviews/feedback`: Export human-in-the-loop validation datasets.

---

## 5. Model Lab & Registry
- `GET /models`: List all registered neural backbones with benchmark metrics.
- `GET /models/{model_id}`: Get confusion matrix, ROC curves, and class definitions.
- `POST /models/{model_id}/toggle-status`: Enable or disable active model serving.

---

## 6. Experiments & Audit Trail
- `GET /experiments`: List training runs with epoch loss and validation accuracy curves.
- `GET /analytics/dashboard`: Aggregate 7-day scan trends, risk distribution, and KPI counters.
- `GET /audit`: Query immutable audit ledger.
