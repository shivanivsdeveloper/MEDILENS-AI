import {
  ScanItem, PatientItem, ReviewQueueItem, ModelEntry,
  ExperimentItem, DashboardAnalytics, SystemHealthData, AuditLogItem
} from '../types';

const API_BASE = '/api';

export const api = {
  // System Health
  async getHealth(): Promise<SystemHealthData> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  // Analytics & Dashboard
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
    return res.json();
  },

  // Scans
  async listScans(modality?: string, risk?: string, patient_id?: number): Promise<ScanItem[]> {
    const params = new URLSearchParams();
    if (modality && modality !== 'All') params.append('modality', modality);
    if (risk && risk !== 'All') params.append('risk', risk);
    if (patient_id) params.append('patient_id', patient_id.toString());
    
    const res = await fetch(`${API_BASE}/scans?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch scans list');
    return res.json();
  },

  async getScan(id: number): Promise<ScanItem> {
    const res = await fetch(`${API_BASE}/scans/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch scan #${id}`);
    return res.json();
  },

  async uploadScan(file: File, patient_id?: number, auto_analyze: boolean = true): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (patient_id) formData.append('patient_id', patient_id.toString());
    formData.append('auto_analyze', auto_analyze.toString());

    const res = await fetch(`${API_BASE}/scans/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  async batchUploadScans(files: File[], patient_id?: number, auto_analyze: boolean = true): Promise<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (patient_id) formData.append('patient_id', patient_id.toString());
    formData.append('auto_analyze', auto_analyze.toString());

    const res = await fetch(`${API_BASE}/scans/batch-upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Batch upload failed');
    return res.json();
  },

  async analyzeScan(scan_id: number, model_id?: string): Promise<any> {
    const params = model_id ? `?model_id=${model_id}` : '';
    const res = await fetch(`${API_BASE}/scans/${scan_id}/analyze${params}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('AI analysis failed');
    return res.json();
  },

  getReportUrl(scan_id: number): string {
    return `${API_BASE}/scans/${scan_id}/report`;
  },

  async deleteScan(scan_id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/scans/${scan_id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Delete failed');
    return res.json();
  },

  // Patients
  async listPatients(): Promise<PatientItem[]> {
    const res = await fetch(`${API_BASE}/patients`);
    if (!res.ok) throw new Error('Failed to fetch patients');
    return res.json();
  },

  async getPatientDetail(id: number): Promise<PatientItem> {
    const res = await fetch(`${API_BASE}/patients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch patient detail');
    return res.json();
  },

  async createPatient(data: { reference_id: string; pseudonym?: string; age?: number; sex?: string; notes?: string }): Promise<PatientItem> {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create patient');
    return res.json();
  },

  // Review Queue
  async getReviewQueue(status?: string): Promise<ReviewQueueItem[]> {
    const params = status && status !== 'All' ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/reviews/queue${params}`);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return res.json();
  },

  async submitReview(data: {
    scan_id: number;
    decision: string;
    reviewer_name?: string;
    reviewer_role?: string;
    corrected_label?: string;
    clinical_notes?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  // Model Lab
  async listModels(): Promise<ModelEntry[]> {
    const res = await fetch(`${API_BASE}/models`);
    if (!res.ok) throw new Error('Failed to fetch models');
    return res.json();
  },

  async getModelDetail(model_id: string): Promise<ModelEntry> {
    const res = await fetch(`${API_BASE}/models/${model_id}`);
    if (!res.ok) throw new Error('Failed to fetch model details');
    return res.json();
  },

  async toggleModelStatus(model_id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/models/${model_id}/toggle-status`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to toggle model status');
    return res.json();
  },

  // Experiments
  async listExperiments(): Promise<ExperimentItem[]> {
    const res = await fetch(`${API_BASE}/experiments`);
    if (!res.ok) throw new Error('Failed to fetch experiments');
    return res.json();
  },

  // Audit Logs
  async listAuditLogs(): Promise<AuditLogItem[]> {
    const res = await fetch(`${API_BASE}/audit`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Research & Embedding Universe
  async getEmbeddingUniverse(): Promise<any> {
    const res = await fetch(`${API_BASE}/research/embeddings`);
    if (!res.ok) throw new Error('Failed to fetch embedding universe data');
    return res.json();
  },

  async getSimilarCases(scan_id: number, top_k: number = 4): Promise<any> {
    const res = await fetch(`${API_BASE}/research/similar-cases/${scan_id}?top_k=${top_k}`);
    if (!res.ok) throw new Error('Failed to fetch similar cases');
    return res.json();
  },

  async getPatientDigitalTwin(patient_id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/research/digital-twin/${patient_id}`);
    if (!res.ok) throw new Error('Failed to fetch patient digital twin');
    return res.json();
  },

  async getProgressionSimulation(patient_id: number, horizon_months: number = 12): Promise<any> {
    const res = await fetch(`${API_BASE}/research/progression/${patient_id}?horizon_months=${horizon_months}`);
    if (!res.ok) throw new Error('Failed to fetch disease progression simulation');
    return res.json();
  },

  async runOrchestration(scan_id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/research/orchestrate/${scan_id}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run multi-agent orchestration');
    return res.json();
  },

  // Research Labs & Intelligence
  async runModelCourtDebate(scan_id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/lab/debate/${scan_id}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run model court debate');
    return res.json();
  },

  async runStressTest(scan_id: number, model_id?: string, perturbations?: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/lab/stress-test/${scan_id}${model_id ? `?model_id=${model_id}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perturbations || null)
    });
    if (!res.ok) throw new Error('Failed to run stress test');
    return res.json();
  },

  async getCalibration(model_id?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/lab/calibration${model_id ? `?model_id=${model_id}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch calibration curve');
    return res.json();
  },

  async runLeakageCheck(): Promise<any> {
    const res = await fetch(`${API_BASE}/lab/leakage-check`);
    if (!res.ok) throw new Error('Failed to run dataset leakage check');
    return res.json();
  },

  async getDatasetHealth(dataset_name?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/lab/health-check${dataset_name ? `?dataset_name=${dataset_name}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch dataset health');
    return res.json();
  },

  async getModelCard(model_id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/lab/model-cards/${model_id}`);
    if (!res.ok) throw new Error('Failed to fetch model card');
    return res.json();
  },

  // Annotation Studio
  async listAnnotations(scan_id: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/annotations?scan_id=${scan_id}`);
    if (!res.ok) throw new Error('Failed to fetch annotations');
    return res.json();
  },

  async createAnnotation(data: {
    scan_id: number;
    author_name?: string;
    author_role?: string;
    annotation_type: string;
    label: string;
    data_json: string;
    confidence?: number;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/annotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create annotation');
    return res.json();
  },

  async getReviewerConsensus(scan_id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/annotations/consensus/${scan_id}`);
    if (!res.ok) throw new Error('Failed to fetch reviewer consensus');
    return res.json();
  },

  // Drift Telemetry
  async getDriftStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/drift/status`);
    if (!res.ok) throw new Error('Failed to fetch drift status');
    return res.json();
  }
};
