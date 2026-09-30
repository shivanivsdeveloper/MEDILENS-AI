import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Microscope, Eye, Box, Sliders, RefreshCw, FileText,
  Send, ShieldAlert, CheckCircle2, AlertTriangle, Crosshair,
  Maximize2, ZoomIn, ZoomOut, Contrast, Layers, ArrowLeft
} from 'lucide-react';
import { api, getStaticUrl } from '../api/client';
import { ScanItem, AnalysisData, ModelEntry } from '../types';
import { TopographicalGradCam3D } from '../components/spatial/TopographicalGradCam3D';
import { ConfidenceCard } from '../components/analysis/ConfidenceCard';
import { AITrustPanel } from '../components/analysis/AITrustPanel';
import { Language, translations } from '../i18n/translations';

export const AIAnalysisPage: React.FC<{ language: Language; userRole: string }> = ({
  language,
  userRole
}) => {
  const t = translations[language];
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scanIdParam = searchParams.get('scanId');

  const [scans, setScans] = useState<ScanItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(
    scanIdParam ? Number(scanIdParam) : null
  );
  const [scan, setScan] = useState<ScanItem | null>(null);
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  const [viewMode, setViewMode] = useState<'2D_OVERLAY' | '3D_ELEVATION' | 'SEGMENTATION' | 'RAW'>('2D_OVERLAY');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.55);
  const [heightScale, setHeightScale] = useState<number>(1.5);
  const [sweepPlane, setSweepPlane] = useState<number>(0.5);
  const [wireframe, setWireframe] = useState<boolean>(false);

  // 2D Viewer Controls
  const [zoom, setZoom] = useState<number>(1.0);
  const [invert, setInvert] = useState<boolean>(false);
  const [contrast, setContrast] = useState<number>(100);
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number } | null>(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewDecision, setReviewDecision] = useState<string>('Accepted');
  const [correctedLabel, setCorrectedLabel] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  useEffect(() => {
    loadScansAndModels();
  }, []);

  useEffect(() => {
    if (selectedScanId) {
      loadScanDetail(selectedScanId);
    }
  }, [selectedScanId]);

  const loadScansAndModels = async () => {
    try {
      const [scansList, modelsList] = await Promise.all([
        api.listScans(),
        api.listModels()
      ]);
      setScans(scansList);
      setModels(modelsList);

      if (!selectedScanId && scansList.length > 0) {
        setSelectedScanId(scansList[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadScanDetail = async (id: number) => {
    try {
      const data = await api.getScan(id);
      setScan(data);
      if (data.analysis) {
        setCorrectedLabel(data.analysis.predicted_label);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReanalyze = async () => {
    if (!selectedScanId) return;
    setIsAnalyzing(true);
    try {
      await api.analyzeScan(selectedScanId, selectedModelId || undefined);
      await loadScanDetail(selectedScanId);
    } catch (err: any) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedScanId) return;
    window.open(api.getReportUrl(selectedScanId), '_blank');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScanId) return;
    setIsSubmittingReview(true);
    try {
      await api.submitReview({
        scan_id: selectedScanId,
        decision: reviewDecision,
        reviewer_name: userRole,
        reviewer_role: userRole,
        corrected_label: reviewDecision === 'Corrected' ? correctedLabel : undefined,
        clinical_notes: clinicalNotes
      });
      setShowReviewModal(false);
      await loadScanDetail(selectedScanId);
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleMouseMoveViewer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 512);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 512);
    setReticlePos({ x, y });
  };

  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-telemetry-cyan animate-spin" />
        <div className="text-xs font-mono text-slate-400">INITIALIZING WORKSTATION...</div>
      </div>
    );
  }

  const analysis = scan.analysis;

  return (
    <div className="space-y-6">
      {/* Workstation Header & Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl spatial-glass border border-coherent-blue/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-surface-card border border-surface-border text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Microscope className="w-5 h-5 text-telemetry-cyan" />
                <span>AI Diagnostic Workstation</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-coherent-blue/15 text-coherent-blue border border-coherent-blue/30 font-bold">
                {scan.scan_uid}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Modality: <span className="text-slate-200">{scan.detected_modality}</span> | Patient: <span className="text-slate-200">{scan.patient_reference_id || 'Unassigned'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Scan Selector */}
          <select
            value={selectedScanId || ''}
            onChange={(e) => setSelectedScanId(Number(e.target.value))}
            className="bg-surface-panel border border-surface-border focus:border-telemetry-cyan rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none cursor-pointer"
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} - {s.detected_modality} ({s.predicted_label || 'Pending'})
              </option>
            ))}
          </select>

          <button
            onClick={handleReanalyze}
            disabled={isAnalyzing}
            className="px-3.5 py-2 bg-surface-card hover:bg-surface-card/80 border border-surface-border text-slate-200 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-telemetry-cyan ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="px-3.5 py-2 bg-synaptic-indigo/20 hover:bg-synaptic-indigo/30 border border-synaptic-indigo/40 text-synaptic-indigo rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send for Review</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-gradient-to-r from-coherent-blue to-telemetry-cyan hover:from-telemetry-cyan hover:to-coherent-blue text-matrix-black font-semibold rounded-xl text-xs font-mono flex items-center gap-1.5 shadow-glow-cyan transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.download_report}</span>
          </button>
        </div>
      </div>

      {/* Main Workstation 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multi-modal Radiographic Viewer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Viewer Mode Tabs & Controls Header */}
          <div className="p-4 rounded-xl spatial-glass border border-surface-border flex items-center justify-between flex-wrap gap-3">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-surface-panel p-1 rounded-lg border border-surface-border text-xs font-mono">
              <button
                onClick={() => setViewMode('2D_OVERLAY')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  viewMode === '2D_OVERLAY' ? 'bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Grad-CAM++</span>
              </button>
              <button
                onClick={() => setViewMode('3D_ELEVATION')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  viewMode === '3D_ELEVATION' ? 'bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/40 font-semibold shadow-glow-cyan' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>2.5D Elevation</span>
              </button>
              <button
                onClick={() => setViewMode('SEGMENTATION')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  viewMode === 'SEGMENTATION' ? 'bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ROI Mask</span>
              </button>
              <button
                onClick={() => setViewMode('RAW')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  viewMode === 'RAW' ? 'bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/40 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Raw DICOM</span>
              </button>
            </div>

            {/* Quick Viewer Adjustments */}
            {viewMode !== '3D_ELEVATION' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.8, Math.round((z - 0.2) * 10) / 10))}
                  className="p-1.5 rounded bg-surface-panel border border-surface-border text-slate-300 hover:text-telemetry-cyan"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, Math.round((z + 0.2) * 10) / 10))}
                  className="p-1.5 rounded bg-surface-panel border border-surface-border text-slate-300 hover:text-telemetry-cyan"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setInvert(!invert)}
                  className={`p-1.5 rounded border transition-colors ${invert ? 'bg-coherent-blue/20 text-telemetry-cyan border-coherent-blue' : 'bg-surface-panel text-slate-300 border-surface-border'}`}
                  title="Invert Radiograph Grayscale"
                >
                  <Contrast className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Interactive Screen Display Area */}
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden radiograph-viewport border border-surface-border relative select-none">
            {viewMode === '3D_ELEVATION' ? (
              <TopographicalGradCam3D
                elevationGrid={analysis?.elevation_grid}
                sweepPlane={sweepPlane}
                heightScale={heightScale}
                wireframe={wireframe}
              />
            ) : (
              <div
                onMouseMove={handleMouseMoveViewer}
                onMouseLeave={() => setReticlePos(null)}
                className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-crosshair"
              >
                {/* Image Container with Zoom/Invert */}
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    filter: `invert(${invert ? 1 : 0}) contrast(${contrast}%)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Base Radiograph */}
                  <img
                    src={getStaticUrl(
                      viewMode === 'SEGMENTATION' && analysis?.segmentation_mask_url
                        ? analysis.segmentation_mask_url
                        : scan.file_url
                    )}
                    alt="Radiograph"
                    className="max-h-full max-w-full object-contain"
                  />

                  {/* Grad-CAM++ Overlay Layer */}
                  {viewMode === '2D_OVERLAY' && analysis?.heatmap_url && (
                    <img
                      src={getStaticUrl(analysis.heatmap_url)}
                      alt="Grad-CAM Overlay"
                      style={{ opacity: heatmapOpacity }}
                      className="absolute max-h-full max-w-full object-contain pointer-events-none mix-blend-screen"
                    />
                  )}
                </div>

                {/* Sub-Pixel Density Reticle Telemetry HUD */}
                {reticlePos && (
                  <div className="absolute top-4 left-4 bg-matrix-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-coherent-blue/30 text-[11px] font-mono text-telemetry-cyan pointer-events-none flex items-center gap-3">
                    <Crosshair className="w-3.5 h-3.5 text-telemetry-cyan" />
                    <span>X: {reticlePos.x}px | Y: {reticlePos.y}px</span>
                    <span className="text-slate-400">HU: ~{Math.round(reticlePos.x * 0.45 + reticlePos.y * 0.2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Sliders Panel */}
          <div className="p-4 rounded-xl spatial-glass border border-surface-border">
            {viewMode === '2D_OVERLAY' ? (
              <div className="flex items-center gap-4">
                <Sliders className="w-4 h-4 text-coherent-blue shrink-0" />
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-36">Grad-CAM Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={heatmapOpacity}
                    onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                    className="flex-1 accent-telemetry-cyan cursor-pointer"
                  />
                  <span className="text-xs font-mono text-telemetry-cyan w-12 text-right">
                    {Math.round(heatmapOpacity * 100)}%
                  </span>
                </div>
              </div>
            ) : viewMode === '3D_ELEVATION' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 w-28">Height Scale:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={heightScale}
                    onChange={(e) => setHeightScale(parseFloat(e.target.value))}
                    className="flex-1 accent-coherent-blue cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-200">{heightScale}x</span>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-400 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={wireframe}
                      onChange={(e) => setWireframe(e.target.checked)}
                      className="accent-telemetry-cyan"
                    />
                    <span>Wireframe Surface Mesh</span>
                  </label>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: AI Inference Findings & Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary Finding Card */}
          <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/30 shadow-glow-cyan space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Primary Screening Indication
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                  analysis?.risk_indicator === 'Low'
                    ? 'bg-clinical-green/15 text-clinical-green border border-clinical-green/30'
                    : analysis?.risk_indicator === 'Moderate'
                    ? 'bg-alert-amber/15 text-alert-amber border border-alert-amber/30'
                    : analysis?.risk_indicator === 'High'
                    ? 'bg-alert-crimson/15 text-alert-crimson border border-alert-crimson/30'
                    : 'bg-synaptic-violet/15 text-synaptic-violet border border-synaptic-violet/30'
                }`}
              >
                {analysis?.risk_indicator || 'Pending'} RISK
              </span>
            </div>

            <div>
              <div className="text-2xl font-black tracking-wide text-slate-100">
                {analysis?.predicted_label || 'Analysis Pending'}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {analysis?.risk_rationale}
              </p>
            </div>

            {/* Probability & Confidence Meters */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-border">
              <div className="p-3 rounded-lg bg-surface-panel/80 border border-surface-border">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Probability</div>
                <div className="text-lg font-bold font-mono text-telemetry-cyan mt-0.5">
                  {analysis ? `${Math.round(analysis.probability * 1000) / 10}%` : '--'}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-surface-panel/80 border border-surface-border">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Shannon Uncertainty</div>
                <div className="text-lg font-bold font-mono text-synaptic-violet mt-0.5">
                  {analysis ? analysis.uncertainty_score : '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Probability Distribution Spectrum */}
          {analysis && analysis.all_predictions && (
            <div className="p-5 rounded-xl spatial-glass border border-surface-border space-y-3">
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Multi-Class Probability Spectrum</span>
                <span className="text-[10px] font-mono text-slate-500">Softmax Output</span>
              </div>
              <div className="space-y-2">
                {analysis.all_predictions.map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className={p.is_primary ? 'font-bold text-telemetry-cyan' : 'text-slate-400'}>
                        {p.label}
                      </span>
                      <span className="text-slate-300 font-semibold">{p.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-panel rounded-full overflow-hidden">
                      <div
                        style={{ width: `${p.percentage}%` }}
                        className={`h-full rounded-full ${
                          p.is_primary ? 'bg-gradient-to-r from-coherent-blue to-telemetry-cyan' : 'bg-slate-600'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Quality Breakdown Scorecard */}
          <div className="p-5 rounded-xl spatial-glass border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Diagnostic Quality Scorecard</span>
              <span className="text-xs font-mono font-bold text-clinical-green">
                {scan.quality_score}/100 ({scan.quality_category})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded bg-surface-panel border border-surface-border">
                <div className="text-[10px] text-slate-500">Sharpness</div>
                <div className="font-bold text-slate-200">{scan.quality_metrics?.sharpness_score || '--'}</div>
              </div>
              <div className="p-2 rounded bg-surface-panel border border-surface-border">
                <div className="text-[10px] text-slate-500">Contrast</div>
                <div className="font-bold text-slate-200">{scan.quality_metrics?.contrast_score || '--'}</div>
              </div>
              <div className="p-2 rounded bg-surface-panel border border-surface-border">
                <div className="text-[10px] text-slate-500">SNR Level</div>
                <div className="font-bold text-slate-200">{scan.quality_metrics?.snr_score || '--'}</div>
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {scan.quality_metrics?.status_summary}
            </div>
          </div>

          {/* Model Architecture Details */}
          <div className="p-4 rounded-xl bg-surface-panel/60 border border-surface-border text-xs font-mono space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Engine Architecture:</span>
              <span className="text-slate-200 font-semibold">{analysis?.model_name} v{analysis?.model_version}</span>
            </div>
            <div className="flex justify-between">
              <span>Inference Speed:</span>
              <span className="text-telemetry-cyan font-bold">{analysis?.inference_time_ms} ms</span>
            </div>
            <div className="flex justify-between">
              <span>Out-of-Distribution:</span>
              <span className={analysis?.is_ood ? 'text-alert-crimson font-bold' : 'text-clinical-green'}>
                {analysis?.is_ood ? 'FLAGGED (OOD)' : 'In-Distribution (PASS)'}
              </span>
            </div>
          </div>

          {/* Research AI Confidence & Safety Gatekeeper Card */}
          {analysis && (
            <ConfidenceCard analysis={analysis} qualityScore={scan.quality_score} />
          )}

          {/* AI Decision Provenance & Trust Panel */}
          {analysis && (
            <AITrustPanel analysis={analysis} />
          )}
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-matrix-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-clinical-dark border border-coherent-blue/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-glow-cyan">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-telemetry-cyan" />
                <span>Submit Clinical Review & Sign-Off</span>
              </h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Decision Status</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value)}
                  className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100 focus:border-telemetry-cyan focus:outline-none"
                >
                  <option value="Accepted">Accept AI Finding ({analysis?.predicted_label})</option>
                  <option value="Corrected">Correct Diagnostic Finding (Override Label)</option>
                  <option value="Escalated">Escalate to Senior Consultant</option>
                  <option value="Rejected">Reject (Inadequate Radiograph)</option>
                </select>
              </div>

              {reviewDecision === 'Corrected' && (
                <div>
                  <label className="block text-slate-400 mb-1">Corrected Diagnosis Label</label>
                  <input
                    type="text"
                    value={correctedLabel}
                    onChange={(e) => setCorrectedLabel(e.target.value)}
                    className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100 focus:border-telemetry-cyan focus:outline-none"
                    placeholder="e.g. Atelectasis / Normal"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Clinician Radiologic Notes</label>
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100 focus:border-telemetry-cyan focus:outline-none"
                  placeholder="Enter anatomical observations, follow-up recommendations, or clinical rationale..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-lg bg-surface-card text-slate-300 hover:text-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-bold rounded-lg shadow-glow-cyan"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Sign & Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
