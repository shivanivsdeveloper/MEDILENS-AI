# MediScan AI: An Institutional-Grade Spatial Medical Image Screening & Explainability Platform
## Academic & Technical Project Report

---

## 1. Abstract
Medical image interpretation requires high precision, explainability, and rigorous safety controls. Traditional computer-assisted diagnostic (CAD) systems often operate as black boxes, lacking uncertainty quantification, image quality validation, or longitudinal comparisons. This project presents **MediScan AI**, an institutional-grade, multi-modality screening and explainability platform built on a decoupled FastAPI backend and a WebGL/Three.js spatial medical computing frontend. The platform integrates five deep learning modules (Chest X-ray, Retinal Fundus, Skin Lesion, Bone X-ray, and Brain MRI), paired with Grad-CAM/Grad-CAM++ explainability, 2.5D topographical saliency elevation modeling, Shannon predictive entropy estimation, automated image quality assessment, and an immutable Human-In-The-Loop (HITL) review queue.

---

## 2. Introduction & Problem Statement
### 2.1 Problem Statement
The proliferation of deep learning in radiology and computer vision has yielded high benchmark accuracies. However, clinical translation is constrained by four fundamental challenges:
1. **Opaque Decision Making**: Clinicians cannot discern the radiological basis for neural network activations.
2. **Silent Failure on Substandard Data**: Severe blur, contrast clipping, or out-of-distribution (OOD) images produce misleadingly confident classifications.
3. **Absence of Reviewer Governance**: Disconnect between automated models and clinical radiologist sign-off workflows.
4. **Data Privacy & Cloud Dependency**: Requirement for external cloud inference creates regulatory and patient confidentiality bottlenecks.

### 2.2 Objectives
- Develop a modular clinical inference framework supporting 5 distinct modalities with transfer-learned ResNet-50 backbones.
- Implement an automated Image Quality Engine (0–100 score) assessing sharpness (Laplacian variance), contrast (RMS/Michelson), exposure clipping, and signal-to-noise ratio.
- Construct a 2.5D Topographical Elevation visualizer extruding Grad-CAM heatmaps along the Z-axis into an interactive 3D terrain.
- Implement Shannon entropy uncertainty calibration and energy-based OOD detection.
- Provide full longitudinal split comparison and automated ReportLab PDF screening reports.
- Support strict offline, air-gapped execution with bilingual (English & Tamil) localization.

---

## 3. System Architecture & Methodology

```
+-------------------------------------------------------------------------------+
|                         FRONTEND (REACT + THREE.JS)                           |
|  [3D Point Cloud Auth] -> [Dashboard HUD] -> [2.5D Topographical Grad-CAM]    |
|  [Longitudinal Split Comparison] -> [Review Queue] -> [Bilingual EN/TA Hub]   |
+-------------------------------------------------------------------------------+
                                        | REST API (JSON / Multipart)
                                        v
+-------------------------------------------------------------------------------+
|                             FASTAPI BACKEND                                   |
|  [Image Quality Engine] -> [Modality Auto-Detector] -> [Preproc CLAHE]        |
|  [PyTorch ResNet-50 Modules] -> [Grad-CAM++] -> [ROI Segmentation Engine]      |
|  [Shannon Entropy Engine] -> [Energy-Score OOD] -> [Risk Stratification]     |
|  [ReportLab PDF Engine] -> [SQLAlchemy DB Repository] -> [Audit Trail]        |
+-------------------------------------------------------------------------------+
```

---

## 4. Machine Learning & Explainability Engine

### 4.1 Modality Architecture & Datasets
1. **Chest X-ray Screening Suite**: ResNet-50 trained on NIH ChestX-ray14 & CheXpert. Target classes: Normal, Pneumonia, Infiltration, Effusion, Atelectasis, Nodule.
2. **Retinal Fundus Screening Suite**: ResNet-50 trained on EyePACS & Messidor-2. Target classes: Normal, Diabetic Retinopathy, Glaucoma, AMD.
3. **Dermatological Lesion Classifier**: ResNet-50 trained on ISIC 2019. Target classes: Benign Nevus, Melanoma, Basal Cell Carcinoma.
4. **Musculoskeletal Radiograph Analyzer**: ResNet-50 trained on Stanford MURA. Target classes: Normal, Fracture, Osteopenia.
5. **Neuro-Imaging Brain MRI Suite**: ResNet-50 trained on BraTS 2021. Target classes: No Tumor, Glioma, Meningioma, Pituitary.

### 4.2 Explainable AI (Grad-CAM++)
Grad-CAM++ generates saliency weights $\alpha_{k}^c$ using higher-order derivatives of class score $Y^c$ with respect to feature activation map $A^k$:
$$\alpha_{k, ij}^c = \frac{\frac{\partial^2 Y^c}{(\partial A_{ij}^k)^2}}{2 \frac{\partial^2 Y^c}{(\partial A_{ij}^k)^2} + \sum_{a,b} A_{ab}^k \frac{\partial^3 Y^c}{(\partial A_{ij}^k)^3}}$$
The resultant activation map is normalized and extruded into a 32x32 topographical mesh for spatial 3D inspection.

### 4.3 Uncertainty Quantification
Normalized Shannon Entropy $H_{norm}(P)$ is derived across softmax probabilities $P = [p_1, p_2, \dots, p_k]$:
$$H(P) = -\sum_{i=1}^k p_i \log_2(p_i), \quad H_{norm}(P) = \frac{H(P)}{\log_2(k)}$$

---

## 5. Verification & Results
The platform underwent automated test suite validation covering:
- Image quality metrics scoring and bounding.
- Modality classification and out-of-distribution rejection.
- PyTorch Grad-CAM computation and 2.5D elevation generation.
- PDF generation and clinical sign-off workflow.

All tests passed with 100% assertion compliance.

---

## 6. Conclusion & Future Work
MediScan AI delivers an end-to-end, production-quality medical AI screening environment with spatial 3D interactivity, rigorous quality pre-checks, and transparent safety guardrails. Future milestones include DICOM networking (PACS DIMSE / DICOMweb integration), federated multi-center model updates, and multi-slice 3D volumetric CT/MRI reconstructions.
