# MediScan AI — Technical Architecture Specification

## 1. High-Level Architectural Principles
MediScan AI is structured according to domain-driven modular design principles:
- **Separation of Concerns**: Decoupled presentation, API routing, business services, ML inference modules, and data persistence repositories.
- **Pluggable Medical Engine**: The abstract `MedicalModule` interface allows new anatomical modalities and architectures to be registered dynamically without modifying core pipeline logic.
- **Deterministic Risk Stratification**: The `RiskEngine` enforces transparent, rules-based logic combining label severity, probability margin, uncertainty score, image quality, and OOD flags.

## 2. Component Diagram

```
+---------------------------------------------------------------------------------+
|                                FRONTEND LAYER                                   |
|   React 18 + Vite + TypeScript + Tailwind CSS                                   |
|   Three.js + React Three Fiber + Drei (3D Spatial Computing)                    |
|   Lucide Icons + Recharts + React Router DOM                                    |
+---------------------------------------------------------------------------------+
                                       |
                           HTTP / REST / JSON & Multipart
                                       v
+---------------------------------------------------------------------------------+
|                                BACKEND LAYER                                    |
|   FastAPI Application Gateway & Router Middleware                               |
|   +-------------------------------------------------------------------------+   |
|   | Services Layer (ScanService, SeedService)                               |   |
|   +-------------------------------------------------------------------------+   |
|   | Machine Learning Subsystem                                              |   |
|   |   • Model Registry Singleton (Routing & Lifecycle)                     |   |
|   |   • Image Quality Assessment Engine (Laplacian / RMS / SNR)              |   |
|   |   • Modality Auto-Identification Classifier                             |   |
|   |   • Diagnostic Modules: Chest X-ray, Retinal, Skin, Bone, Brain MRI     |   |
|   |   • Grad-CAM / Grad-CAM++ Explainability & Topographical Extrusion      |   |
|   |   • Morphological ROI Segmentation Engine                               |   |
|   |   • Shannon Entropy Uncertainty Quantification Engine                   |   |
|   |   • Energy-Based Out-Of-Distribution (OOD) Detector                     |   |
|   |   • Deterministic Clinical Risk Stratification Engine                   |   |
|   +-------------------------------------------------------------------------+   |
|   | PDF Screening Report Generator (ReportLab 4.x Engine)                   |   |
|   +-------------------------------------------------------------------------+   |
|   | Data Access & Repository Layer (SQLAlchemy ORM, BaseRepository)         |   |
+---------------------------------------------------------------------------------+
                                       |
                                SQL / Filesystem
                                       v
+---------------------------------------------------------------------------------+
|                               STORAGE LAYER                                     |
|   SQLite / PostgreSQL Engine (mediscan.db)                                      |
|   Local Radiograph Filesystem Storage (/data/raw, /outputs, /reports)            |
+---------------------------------------------------------------------------------+
```
