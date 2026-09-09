# Installation & Deployment Manual

## System Requirements
- **Operating System**: Windows 10/11, macOS (Apple Silicon / Intel), or Ubuntu Linux 22.04+
- **Python**: 3.11+
- **Node.js**: v18.0.0 or higher
- **RAM**: 8 GB minimum (16 GB recommended for multi-modal PyTorch models)
- **Disk Space**: 5 GB for dependencies, sample datasets, and report artifacts

---

## 1. Backend Setup

```bash
# In project root:
cd backend

# Create virtual environment with uv (or standard python):
uv venv .venv --python python3.11

# Install required Python packages:
uv pip install -r requirements.txt --python .venv/Scripts/python.exe
```

---

## 2. Frontend Setup

```bash
# In project root:
cd frontend

# Install Node dependencies:
npm install

# Verify production build:
npm run build
```

---

## 3. Running MediScan AI Locally

### Terminal 1: Launch Backend API
```bash
# In project root:
backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: Launch Frontend Console
```bash
# In project root:
cd frontend
npm run dev
```

Open your browser at `http://localhost:5173` to access the full MediScan AI Spatial Medical Workstation.
Interactive Swagger API documentation is available at `http://localhost:8000/docs`.
