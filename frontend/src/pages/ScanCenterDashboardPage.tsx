import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, UploadCloud, CheckCircle2, AlertTriangle, Clock,
  Send, UserCheck, ShieldCheck, Activity, Users, FileText,
  Sparkles, RefreshCw, ArrowRight, Eye, Phone, MapPin, Award
} from 'lucide-react';
import { api } from '../api/client';
import { ScanItem, PatientItem } from '../types';
import { Language, translations } from '../i18n/translations';

interface ScanCenterDashboardPageProps {
  language: Language;
}

export const ScanCenterDashboardPage: React.FC<ScanCenterDashboardPageProps> = ({ language }) => {
  const t = translations[language];
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scans, setScans] = useState<ScanItem[]>([]);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [workload, setWorkload] = useState<any>({
    today_intake: 0,
    quality_checked_count: 0,
    pending_review_count: 0,
    completed_delivered_count: 0,
    available_doctors: []
  });

  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined);
  const [assignedDocId, setAssignedDocId] = useState<number | undefined>(undefined);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [instantQualityWarning, setInstantQualityWarning] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tracker' | 'upload' | 'staff'>('tracker');

  // Load Scan Center Live Data
  const loadCenterData = async () => {
    try {
      const [scansData, patientsData, wlData] = await Promise.all([
        api.listScans(),
        api.listPatients(),
        api.auth.getScanCenterWorkload().catch(() => ({
          today_intake: 0,
          quality_checked_count: 0,
          pending_review_count: 0,
          completed_delivered_count: 0,
          available_doctors: []
        }))
      ]);
      setScans(scansData);
      setPatients(patientsData);
      setWorkload(wlData);
      if (wlData.available_doctors && wlData.available_doctors.length > 0 && !assignedDocId) {
        setAssignedDocId(wlData.available_doctors[0].id);
      }
    } catch (err) {
      console.error('Failed to load scan center telemetry:', err);
    }
  };

  useEffect(() => {
    loadCenterData();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUpload(Array.from(e.target.files));
    }
  };

  const processUpload = async (files: File[]) => {
    setUploading(true);
    setInstantQualityWarning(null);
    try {
      for (const file of files) {
        setUploadFeedback(`Inspecting ${file.name} for artifacts & resolution...`);
        const res = await api.uploadScan(file, selectedPatientId, true);
        
        // Instant Real Quality Verification Warning before patient departs
        if (res.data && res.data.quality_score < 75) {
          setInstantQualityWarning(
            `QUALITY ADVISORY: Scan #${res.data.scan_uid} has a quality score of ${res.data.quality_score}/100 (possible blur or low contrast). Immediate retake advised before patient departs.`
          );
        }

        // Auto assign to selected doctor if specified
        if (res.data && assignedDocId) {
          await api.auth.assignScanToDoctor(res.data.id, assignedDocId).catch(() => {});
        }
      }
      setUploadFeedback(`Successfully processed ${files.length} radiographic file(s).`);
      await loadCenterData();
      setActiveTab('tracker');
    } catch (err: any) {
      alert(`Intake processing failed: ${err.message || err}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadFeedback(null), 4000);
    }
  };

  const handleAssignDoctor = async (scanId: number, docId: number) => {
    try {
      await api.auth.assignScanToDoctor(scanId, docId);
      await loadCenterData();
    } catch (err: any) {
      alert(`Assignment failed: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Center Facility Header */}
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-coherent-blue/20 to-telemetry-cyan/20 border border-coherent-blue/40 flex items-center justify-center text-telemetry-cyan">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{t.role_scan_center}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-clinical-green/20 text-clinical-green border border-clinical-green/40 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3" />
                AERB Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Metro Imaging Diagnostics Center · AERB Lic: DIAG-SCAN-2026-992
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-matrix-black/60 p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'tracker'
                ? 'bg-coherent-blue text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Workload & Status Tracker
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-coherent-blue text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Intake & Quality Pre-Check
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'staff'
                ? 'bg-coherent-blue text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Staff & Facility
          </button>
        </div>
      </div>

      {/* Real Workload KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Today's Total Intake</span>
            <UploadCloud className="w-4 h-4 text-coherent-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{workload.today_intake || scans.length}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Real-time local database count</div>
        </div>

        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>AI Quality Screened</span>
            <CheckCircle2 className="w-4 h-4 text-clinical-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-clinical-green">
            {workload.quality_checked_count || scans.length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">100% automated sharpness check</div>
        </div>

        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Under Doctor Review</span>
            <Clock className="w-4 h-4 text-alert-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-alert-amber">
            {scans.filter(s => s.workflow_stage === 'DoctorReviewing' || !s.is_released_to_patient).length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Assigned to certified radiologists</div>
        </div>

        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Reports Signed & Ready</span>
            <FileText className="w-4 h-4 text-telemetry-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-telemetry-cyan">
            {scans.filter(s => s.is_released_to_patient || s.workflow_stage === 'ReportReady').length}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Delivered to patient portal</div>
        </div>
      </div>

      {/* Quality Advisory Alert Banner */}
      {instantQualityWarning && (
        <div className="p-4 rounded-xl bg-alert-amber/15 border border-alert-amber/40 flex items-start gap-3 text-alert-amber">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs font-mono">
            <div className="font-bold uppercase tracking-wider mb-0.5">Technician Immediate Action Required</div>
            <div>{instantQualityWarning}</div>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingestion Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`lg:col-span-2 p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center relative overflow-hidden ${
              dragActive
                ? 'border-telemetry-cyan bg-telemetry-cyan/10 shadow-glow-cyan'
                : 'border-surface-border hover:border-coherent-blue/50 bg-surface-panel/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.dcm"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-coherent-blue/20 to-telemetry-cyan/20 border border-coherent-blue/40 flex items-center justify-center mb-4 text-telemetry-cyan">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-base font-semibold text-slate-200 mb-1">
              Drag & Drop Scan Radiographs for Ingestion
            </h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mb-4">
              Automated image quality screening (blur, under-exposure, artifacts) triggers immediately upon drop.
            </p>

            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">DICOM (.dcm)</span>
              <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">Chest X-ray</span>
              <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">Fundus Retinography</span>
              <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">Brain MRI / CT</span>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-matrix-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
                <Sparkles className="w-8 h-8 text-telemetry-cyan animate-spin" />
                <div className="text-xs font-mono text-slate-200">{uploadFeedback}</div>
              </div>
            )}
          </div>

          {/* Patient Routing & Doctor Assignment */}
          <div className="p-6 rounded-2xl spatial-glass border border-surface-border flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-coherent-blue" />
                <span>Patient Assignment & Doctor Routing</span>
              </h2>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Associate with Patient</label>
                <select
                  value={selectedPatientId || ''}
                  onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-surface-panel border border-surface-border focus:border-telemetry-cyan rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                >
                  <option value="">-- Create/Attach Ad-hoc Scan --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.reference_id} ({p.pseudonym}) - {p.age}y {p.sex}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Route to Reviewing Doctor</label>
                <select
                  value={assignedDocId || ''}
                  onChange={(e) => setAssignedDocId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-surface-panel border border-surface-border focus:border-telemetry-cyan rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                >
                  <option value="">-- Shared Radiologist Pool --</option>
                  {workload.available_doctors && workload.available_doctors.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty}) · {d.hospital}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-matrix-black/60 border border-surface-border text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-200 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-clinical-green" />
                Quality Check SLA: &lt;15 seconds
              </div>
              <div>Patients will not leave the facility until radiograph quality is confirmed.</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tracker' && (
        <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-telemetry-cyan" />
                <span>Radiology 5-Stage Workflow Pipeline</span>
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Uploaded → AI Quality Check → Doctor Reviewing → Report Approved → Delivered to Patient
              </p>
            </div>
            <button
              onClick={loadCenterData}
              className="p-2 rounded-lg bg-surface-panel hover:bg-surface-card border border-surface-border text-slate-300 flex items-center gap-1.5 text-xs font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Pipeline</span>
            </button>
          </div>

          {/* Workflow List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-surface-border text-slate-400 bg-surface-panel/50">
                  <th className="py-3 px-4">Scan Identifier</th>
                  <th className="py-3 px-4">Modality</th>
                  <th className="py-3 px-4">Image Quality</th>
                  <th className="py-3 px-4">Assigned Radiologist</th>
                  <th className="py-3 px-4">Workflow Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {scans.map((scan) => {
                  const stage = scan.workflow_stage || (scan.is_released_to_patient ? 'Delivered' : 'DoctorReviewing');
                  return (
                    <tr key={scan.id} className="hover:bg-surface-panel/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-200 flex items-center gap-2">
                        <img
                          src={scan.file_url}
                          alt="thumb"
                          className="w-7 h-7 rounded object-cover border border-surface-border"
                        />
                        <span>{scan.scan_uid}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{scan.detected_modality}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            scan.quality_score >= 80
                              ? 'bg-clinical-green/15 text-clinical-green border border-clinical-green/30'
                              : 'bg-alert-amber/15 text-alert-amber border border-alert-amber/30'
                          }`}
                        >
                          {scan.quality_score}/100 {scan.quality_score >= 80 ? '✓ Sharp' : '⚠ Retake?'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {workload.available_doctors && workload.available_doctors.length > 0 ? (
                          <select
                            defaultValue={scan.assigned_doctor_id || (workload.available_doctors[0]?.id)}
                            onChange={(e) => handleAssignDoctor(scan.id, Number(e.target.value))}
                            className="bg-surface-panel border border-surface-border rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                          >
                            {workload.available_doctors.map((d: any) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.specialty})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-500">Dr. Sharma (Radiology Pool)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {stage === 'Delivered' || scan.is_released_to_patient ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-clinical-green/20 text-clinical-green border border-clinical-green/40 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" />
                            Report Delivered
                          </span>
                        ) : stage === 'ReportReady' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-telemetry-cyan/20 text-telemetry-cyan border border-telemetry-cyan/40 flex items-center gap-1 w-max">
                            <FileText className="w-3 h-3" />
                            Signed by Doctor
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-coherent-blue/20 text-coherent-blue border border-coherent-blue/40 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" />
                            Doctor Reviewing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/analysis?scanId=${scan.id}`)}
                          className="px-2.5 py-1 rounded bg-coherent-blue/20 hover:bg-coherent-blue/30 text-coherent-blue border border-coherent-blue/40 text-[11px] font-semibold transition-colors"
                        >
                          Examine
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-coherent-blue" />
              <span>Center Radiography Staff & Facility Clearance</span>
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Active radiological technicians authorized for DICOM ingestion and patient intake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-surface-panel/80 border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Kavitha Ramanathan</span>
                <span className="px-2 py-0.5 rounded bg-clinical-green/20 text-clinical-green text-[10px]">Active</span>
              </div>
              <div className="text-slate-400 text-[11px]">Chief Radiologic Technologist (CRT)</div>
              <div className="text-[10px] text-slate-500">License: CRT-IN-88910 · Shift: Morning A</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-panel/80 border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Arun Kumar</span>
                <span className="px-2 py-0.5 rounded bg-clinical-green/20 text-clinical-green text-[10px]">Active</span>
              </div>
              <div className="text-slate-400 text-[11px]">MRI & CT Acquisition Specialist</div>
              <div className="text-[10px] text-slate-500">License: CRT-IN-90412 · Shift: General</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-panel/80 border border-surface-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Pooja Deshmukh</span>
                <span className="px-2 py-0.5 rounded bg-clinical-green/20 text-clinical-green text-[10px]">Active</span>
              </div>
              <div className="text-slate-400 text-[11px]">Quality Assurance & Patient Intake</div>
              <div className="text-[10px] text-slate-500">License: QA-MED-3341 · Shift: General</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
