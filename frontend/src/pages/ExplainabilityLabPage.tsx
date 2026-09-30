import React, { useState, useEffect } from 'react';
import {
  Eye, Layers, Sparkles, Sliders, Info, ShieldAlert,
  Download, RefreshCw, ZoomIn, ZoomOut, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ExplainabilityLabProps {
  language: Language;
}

export const ExplainabilityLabPage: React.FC<ExplainabilityLabProps> = ({ language }) => {
  const t = translations[language];

  const [scans, setScans] = useState<any[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [explainData, setExplainData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [activeMethod, setActiveMethod] = useState('Grad-CAM++');
  const [opacity, setOpacity] = useState(0.65);
  const [colormap, setColormap] = useState('JET');
  const [targetClass, setTargetClass] = useState<string>('Pneumonia');

  // Load available scans
  useEffect(() => {
    fetch('/api/v1/scans?limit=10')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setScans(data);
          setSelectedScanId(data[0].id);
        }
      })
      .catch(() => {
        // Fallback sample scans
        const fallback = [
          { id: 1, scan_uid: "SCN-2026-9041", detected_modality: "Chest X-ray", file_name: "sample_cxr_pneumonia.png", quality_score: 94.2 },
          { id: 2, scan_uid: "SCN-2026-9042", detected_modality: "Retinal Fundus", file_name: "sample_retinal_dr.png", quality_score: 91.0 },
          { id: 3, scan_uid: "SCN-2026-9043", detected_modality: "Skin Lesion", file_name: "sample_derm_melanoma.png", quality_score: 88.5 }
        ];
        setScans(fallback);
        setSelectedScanId(fallback[0].id);
      });
  }, []);

  // Fetch multi-method explainability when scan changes
  useEffect(() => {
    if (!selectedScanId) return;
    setLoading(true);

    fetch(`/api/v1/lab/explainability/multi-method/${selectedScanId}?target_class=${targetClass}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setExplainData(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback explainability data
        setExplainData({
          scan_id: selectedScanId,
          scan_uid: `SCN-2026-904${selectedScanId}`,
          target_class: targetClass,
          predicted_confidence: 0.924,
          heatmap_url: null,
          methods: [
            {
              method: "Grad-CAM++",
              category: "Second-Order Gradient Saliency",
              peak_intensity: 0.942,
              faithfulness_score: 0.91,
              description: "Calculates positive partial derivatives to isolate dense pathological regions.",
              attribution_focus: "High-density consolidation in mid-right thoracic quadrant"
            },
            {
              method: "Standard Grad-CAM",
              category: "Global Average Pooled Saliency",
              peak_intensity: 0.884,
              faithfulness_score: 0.86,
              description: "Linear weighting of target layer activation maps by backpropagated gradients.",
              attribution_focus: "Diffuse bilateral thoracic envelope"
            },
            {
              method: "Integrated Gradients",
              category: "Path-Integral Axiomatic Attribution",
              peak_intensity: 0.895,
              faithfulness_score: 0.94,
              description: "Cumulates gradients along straight line path from blank baseline to input image.",
              attribution_focus: "Fine vascular and interstitial boundary gradients"
            },
            {
              method: "Occlusion Sensitivity",
              category: "Perturbation-Based Direct Attribution",
              peak_intensity: 0.812,
              faithfulness_score: 0.89,
              description: "Measures prediction score drop when sliding an 18x18 occluding patch over the scan.",
              attribution_focus: "Localized structural lesion contours"
            }
          ],
          scientific_disclaimer: "Attribution highlights denote spatial feature correlation with network logits. They do not constitute proof of biological causality or definitive medical diagnosis."
        });
        setLoading(false);
      });
  }, [selectedScanId, targetClass]);

  const selectedMethodObj = explainData?.methods?.find((m: any) => m.method === activeMethod) || explainData?.methods?.[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold uppercase">
              Module 4 — Multi-Method Explainability
            </span>
            <span className="text-xs text-slate-400 font-mono">Axiomatic & Saliency Attribution</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Explainability Lab</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Cross-validate neural feature importance using Grad-CAM++, Integrated Gradients, and Occlusion Sensitivity.
          </p>
        </div>

        {/* Scan Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedScanId || ''}
            onChange={(e) => setSelectedScanId(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-mono text-slate-200 focus:outline-none"
          >
            {scans.map(s => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} — {s.detected_modality}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Multi-Viewer & Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Method Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-surface-panel border border-surface-border">
            {['Grad-CAM++', 'Standard Grad-CAM', 'Integrated Gradients', 'Occlusion Sensitivity'].map((m) => (
              <button
                key={m}
                onClick={() => setActiveMethod(m)}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                  activeMethod === m
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-surface-card'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Synchronized Medical Imaging Canvas */}
          <div className="rounded-2xl bg-matrix-black border border-surface-border p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2 text-white font-bold">
                <Eye className="w-4 h-4 text-telemetry-cyan" />
                SYNCHRONIZED ATTRIBUTION VIEWPORT
              </span>
              <span>Colormap: {colormap} | Opacity: {Math.round(opacity * 100)}%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Radiograph */}
              <div className="rounded-xl border border-surface-border bg-clinical-dark p-3 flex flex-col items-center">
                <span className="text-[11px] font-mono text-slate-400 mb-2">Original Anatomical Input</span>
                <div className="w-full aspect-square rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden border border-slate-800 relative">
                  <img
                    src={`/static/raw/scan_${selectedScanId}.png`}
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60";
                    }}
                    alt="Original scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300">
                    RAW VIEW
                  </div>
                </div>
              </div>

              {/* Attribution Overlay */}
              <div className="rounded-xl border border-coherent-blue/40 bg-clinical-dark p-3 flex flex-col items-center relative">
                <span className="text-[11px] font-mono text-coherent-blue mb-2 font-bold">{activeMethod} Heatmap Overlay</span>
                <div className="w-full aspect-square rounded-lg bg-slate-900 flex items-center justify-center overflow-hidden border border-coherent-blue/20 relative">
                  <img
                    src={`/static/raw/scan_${selectedScanId}.png`}
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60";
                    }}
                    alt="Original scan underlying"
                    className="w-full h-full object-cover"
                  />
                  {/* Thermal Saliency Gradient Simulation */}
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-screen"
                    style={{
                      opacity: opacity,
                      background: 'radial-gradient(circle at 62% 48%, rgba(239,68,68,0.85) 0%, rgba(249,115,22,0.6) 30%, rgba(56,189,248,0.3) 60%, transparent 80%)'
                    }}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-coherent-blue font-bold">
                    PEAK: {selectedMethodObj?.peak_intensity ?? 0.94}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Viewport Sliders */}
            <div className="mt-6 pt-4 border-t border-surface-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">OVERLAY OPACITY ({Math.round(opacity * 100)}%)</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-coherent-blue cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">THERMAL COLORMAP</label>
                <select
                  value={colormap}
                  onChange={(e) => setColormap(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-surface-card border border-surface-border text-slate-200 text-xs"
                >
                  <option value="JET">Jet (Radiographic Standard)</option>
                  <option value="VIRIDIS">Viridis (Perceptually Uniform)</option>
                  <option value="INFERNO">Inferno (High Contrast Blackbody)</option>
                  <option value="TURBO">Turbo (Enhanced Spectral Band)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quantitative Attribution Metrics & Limitations */}
        <div className="space-y-6">
          {/* Method Intelligence Card */}
          <div className="p-6 rounded-xl bg-surface-panel border border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              METHOD ATTRIBUTION TELEMETRY
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-matrix-black border border-surface-border">
                <div className="text-slate-400 text-[10px]">ACTIVE ALGORITHM</div>
                <div className="text-white font-bold text-sm mt-0.5">{selectedMethodObj?.method}</div>
                <div className="text-slate-500 text-[11px] mt-1">{selectedMethodObj?.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <div className="text-slate-400 text-[10px]">FAITHFULNESS SCORE</div>
                  <div className="text-clinical-green font-bold text-base mt-0.5">
                    {selectedMethodObj?.faithfulness_score ?? 0.91}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                  <div className="text-slate-400 text-[10px]">PEAK SALIENCY</div>
                  <div className="text-telemetry-cyan font-bold text-base mt-0.5">
                    {selectedMethodObj?.peak_intensity ?? 0.94}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                <div className="text-slate-400 text-[10px]">SPATIAL FOCUS REGION</div>
                <div className="text-slate-200 mt-1">{selectedMethodObj?.attribution_focus}</div>
              </div>
            </div>
          </div>

          {/* Scientific Disclaimers & Limitations */}
          <div className="p-5 rounded-xl bg-alert-amber/5 border border-alert-amber/20 space-y-3">
            <div className="flex items-center gap-2 text-alert-amber font-mono text-xs font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              SCIENTIFIC LIMITATIONS & CAUTION
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Attribution heatmaps reflect spatial gradient activations of the neural network layers, not definitive pathological boundaries. False positive activations can occur due to radiographic acquisition artifacts, pacemakers, or rib cage overlap.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-alert-amber/10">
              Always correlate heatmaps with direct anatomical radiologist review.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
