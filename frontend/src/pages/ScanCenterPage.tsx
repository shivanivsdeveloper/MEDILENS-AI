import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud, FileImage, CheckCircle, AlertCircle, Sparkles,
  Users, Layers, ArrowRight, Eye, Trash2, Filter
} from 'lucide-react';
import { api } from '../api/client';
import { ScanItem, PatientItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const ScanCenterPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scans, setScans] = useState<ScanItem[]>([]);
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>(undefined);
  const [selectedModality, setSelectedModality] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [scansData, patientsData] = await Promise.all([
        api.listScans(selectedModality, selectedRisk),
        api.listPatients()
      ]);
      setScans(scansData);
      setPatients(patientsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedModality, selectedRisk]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    try {
      if (files.length === 1) {
        setUploadProgress('Analyzing image quality & executing neural feature inference...');
        const res = await api.uploadScan(files[0], selectedPatientId, true);
        if (res.data && res.data.id) {
          navigate(`/analysis?scanId=${res.data.id}`);
        }
      } else {
        setUploadProgress(`Processing batch of ${files.length} medical radiographs...`);
        await api.batchUploadScans(files, selectedPatientId, true);
        await loadData();
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this scan record?')) {
      await api.deleteScan(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl spatial-glass border border-coherent-blue/20">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-telemetry-cyan" />
            <span>{t.nav_scan_center}</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Ingest radiographic images (.PNG, .JPG, .WEBP, .DICOM) for automated quality assessment and AI screening.
          </p>
        </div>
      </div>

      {/* Upload Zone & Patient Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag & Drop Zone */}
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
            Drag and drop radiographic scans here
          </h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mb-4">
            Supports Chest X-ray, Retinal Fundus, Skin Lesion, Bone X-ray, and Brain MRI.
          </p>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">PNG</span>
            <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">JPG / JPEG</span>
            <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">WEBP</span>
            <span className="px-2.5 py-1 rounded bg-surface-card border border-surface-border">DICOM</span>
          </div>

          {uploading && (
            <div className="absolute inset-0 bg-matrix-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
              <Sparkles className="w-8 h-8 text-telemetry-cyan animate-spin" />
              <div className="text-xs font-mono text-slate-200">{uploadProgress}</div>
            </div>
          )}
        </div>

        {/* Patient Selection & Settings Card */}
        <div className="p-6 rounded-2xl spatial-glass border border-surface-border flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-coherent-blue" />
              <span>Patient Assignment (Optional)</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Associate uploaded scans with a registered patient profile for longitudinal comparison.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Select Patient</label>
              <select
                value={selectedPatientId || ''}
                onChange={(e) => setSelectedPatientId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-surface-panel border border-surface-border focus:border-telemetry-cyan rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
              >
                <option value="">-- Unassigned (Ad-hoc Scan) --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.reference_id} ({p.pseudonym || 'Anonymous'}) - {p.age}y {p.sex}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border text-[11px] font-mono text-slate-500">
            Automated image quality and modality identification will trigger immediately upon ingestion.
          </div>
        </div>
      </div>

      {/* Ingested Scans Library & Filters */}
      <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-telemetry-cyan" />
              <span>Ingested Scans Repository ({scans.length})</span>
            </h2>
            <p className="text-xs font-mono text-slate-400">All local scans in SQLite database</p>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono bg-surface-panel px-3 py-1.5 rounded-lg border border-surface-border">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Modalities</option>
                <option value="Chest X-ray" className="bg-slate-900">Chest X-ray</option>
                <option value="Retinal Fundus" className="bg-slate-900">Retinal Fundus</option>
                <option value="Skin Lesion" className="bg-slate-900">Skin Lesion</option>
                <option value="Bone X-ray" className="bg-slate-900">Bone X-ray</option>
                <option value="Brain MRI" className="bg-slate-900">Brain MRI</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono bg-surface-panel px-3 py-1.5 rounded-lg border border-surface-border">
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">All Risk Levels</option>
                <option value="Low" className="bg-slate-900">Low Risk</option>
                <option value="Moderate" className="bg-slate-900">Moderate Risk</option>
                <option value="High" className="bg-slate-900">High Risk</option>
                <option value="Needs Review" className="bg-slate-900">Needs Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scans Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="p-4 rounded-xl bg-surface-panel/80 border border-surface-border hover:border-coherent-blue/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-matrix-black mb-3 border border-surface-border/50">
                  <img
                    src={scan.file_url}
                    alt={scan.scan_uid}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-matrix-black/80 text-telemetry-cyan border border-white/10">
                    {scan.detected_modality}
                  </div>
                  {scan.is_synthetic_demo && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-synaptic-indigo/80 text-white font-semibold">
                      SAMPLE
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-100">{scan.scan_uid}</span>
                    <span className={`font-semibold ${scan.quality_score >= 80 ? 'text-clinical-green' : 'text-alert-amber'}`}>
                      Q: {scan.quality_score}/100
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    Finding: <span className="text-slate-200 font-semibold">{scan.predicted_label || 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                <button
                  onClick={() => handleDelete(scan.id)}
                  className="p-1.5 rounded text-slate-500 hover:text-alert-crimson transition-colors"
                  title="Delete Scan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/analysis?scanId=${scan.id}`)}
                  className="px-3 py-1.5 rounded-lg bg-coherent-blue/15 hover:bg-coherent-blue/25 text-coherent-blue border border-coherent-blue/30 text-xs font-mono font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Examine</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
