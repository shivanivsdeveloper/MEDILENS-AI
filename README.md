# MediScan AI — Production-Level Medical Image Screening & Explainability Platform

[![Python 3.11](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2+-EE4C2C.svg)](https://pytorch.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-Academic%20Research-green.svg)]()

> **CRITICAL MEDICAL SAFETY NOTICE**
> MediScan AI is an academic research and clinical decision-support platform. It is **NOT** a definitive medical diagnosis system. Every output is designated as an AI screening/research indication and mandates clinical verification by a certified healthcare professional.

---

## 🌟 Key Capabilities & Features

### 1. 3D Spatial Computing & High-Density UI Architecture
- **Interactive 3D Point-Cloud Authentication**: Real-time WebGL particle point-cloud (`@react-three/fiber`) rendering anatomical clusters with harmonic spring parallax and live biometric ECG telemetry.
- **2.5D Topographical Elevation Grad-CAM Visualizer**: Transforms 2D radiograph activations into an interactive 3D terrain mesh where Z-axis elevation correlates with neural attention weights. Includes clipping sweep plane slider.
- **Sub-Pixel Density Reticle HUD**: Mouse-following crosshair with coordinate and estimated radiodensity (Hounsfield Unit approximation) display.

### 2. Multi-Modality PyTorch Inference Engine
- **Chest X-ray Screening Suite** (ResNet-50 trained on NIH ChestX-ray14 & CheXpert: Normal, Pneumonia, Infiltration, Effusion, Atelectasis, Nodule).
- **Retinal Fundus Screening Suite** (ResNet-50 trained on EyePACS & Messidor-2: Normal, Diabetic Retinopathy, Glaucoma, AMD).
- **Dermatological Lesion Classifier** (ResNet-50 trained on ISIC 2019: Benign Nevus, Melanoma, Basal Cell Carcinoma).
- **Musculoskeletal Radiograph Analyzer** (ResNet-50 trained on Stanford MURA: Normal, Fracture, Osteopenia).
- **Neuro-Imaging Brain MRI Suite** (ResNet-50 trained on BraTS 2021: No Tumor, Glioma, Meningioma, Pituitary).

### 3. Explainability, Uncertainty & Safety Guardrails
- **Grad-CAM & Grad-CAM++**: High-resolution heatmap overlays with dynamic opacity control.
- **Automated Image Quality Assessment (0–100 score)**: Laplacian blur/sharpness, RMS contrast, exposure histogram bounding, signal-to-noise ratio (SNR), and resolution adequacy.
- **Out-of-Distribution (OOD) Energy Score Detection**: Rejects corrupted and non-medical images.
- **Shannon Predictive Entropy & Monte Carlo Uncertainty Estimation**.
- **Multi-Factor AI Screening Risk Indicator**: Low, Moderate, High, Needs Review.

### 4. Comprehensive Clinical Workflow
- **Doctor / Reviewer Queue**: Status escalation (Pending, In Review, Accepted, Corrected, Escalated) with Human-In-The-Loop (HITL) feedback capture.
- **Longitudinal Historical Comparison**: Split-screen slider comparing prior baseline and follow-up scans with delta analysis.
- **Institutional PDF Report Generator**: ReportLab generated screening reports with embedded scans, thermal overlays, and audit trails.
- **Bilingual Interface**: Seamless instant toggle between English and Tamil.
- **Air-Gapped & Offline Ready**: 100% local inference with zero mandatory external API dependencies.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+ (virtual environment configured in `backend/.venv`)
- Node.js v18+ and npm

---

### Step 1: Start the Backend API Server

Open a terminal in the project root (`c:\MEDILENS`):

```powershell
# Run Uvicorn server using backend virtual environment:
backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Backend API URL:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc Documentation:** `http://localhost:8000/redoc`

---

### Step 2: Start the Frontend UI

Open a second terminal in the project root:

```powershell
cd frontend
npm run dev
```

- **Frontend Workstation:** `http://localhost:5173`

---

## 🧪 Running Automated Tests

Run the full pytest suite (17 research & platform test suites):

```powershell
backend\.venv\Scripts\python.exe -m pytest backend/tests -v
```

To validate the frontend build:

```powershell
cd frontend
npm run build
```
