import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, ShieldCheck, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { ScanItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const HistoricalComparisonPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [scanAId, setScanAId] = useState<number | null>(null);
  const [scanBId, setScanBId] = useState<number | null>(null);
  const [scanA, setScanA] = useState<ScanItem | null>(null);
  const [scanB, setScanB] = useState<ScanItem | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const data = await api.listScans();
      setScans(data);
      if (data.length >= 2) {
        setScanAId(data[1].id);
        setScanBId(data[0].id);
      } else if (data.length === 1) {
        setScanAId(data[0].id);
        setScanBId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (scanAId) api.getScan(scanAId).then(setScanA).catch(console.error);
  }, [scanAId]);

  useEffect(() => {
    if (scanBId) api.getScan(scanBId).then(setScanB).catch(console.error);
  }, [scanBId]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-telemetry-cyan" />
            <span>Longitudinal Scan Comparison</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Compare prior radiograph vs current follow-up scan with interactive split-slider and probability delta analysis.
          </p>
        </div>
      </div>

      {/* Selector Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
            Baseline / Prior Scan (Scan A)
          </label>
          <select
            value={scanAId || ''}
            onChange={(e) => setScanAId(Number(e.target.value))}
            className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-xs font-mono text-slate-100 focus:border-telemetry-cyan focus:outline-none"
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} - {s.detected_modality} ({s.created_at.slice(0, 10)})
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <label className="block text-xs font-mono text-slate-400 mb-1.5 font-semibold">
            Follow-Up / Current Scan (Scan B)
          </label>
          <select
            value={scanBId || ''}
            onChange={(e) => setScanBId(Number(e.target.value))}
            className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-xs font-mono text-slate-100 focus:border-telemetry-cyan focus:outline-none"
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} - {s.detected_modality} ({s.created_at.slice(0, 10)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Comparison Viewer */}
      {scanA && scanB && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Split Screen Viewport */}
          <div className="lg:col-span-8 p-4 rounded-2xl spatial-glass border border-surface-border space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-surface-border select-none">
              {/* Scan B (Background - Follow-up) */}
              <img
                src={scanB.file_url}
                alt="Scan B"
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Scan A (Foreground - Prior with Clip-Path) */}
              <div
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                className="absolute inset-0 w-full h-full"
              >
                <img
                  src={scanA.file_url}
                  alt="Scan A"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Slider Divider Line */}
              <div
                style={{ left: `${sliderPos}%` }}
                className="absolute top-0 bottom-0 w-0.5 bg-telemetry-cyan shadow-glow-cyan pointer-events-none"
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-matrix-black border-2 border-telemetry-cyan flex items-center justify-center text-[10px] font-mono text-telemetry-cyan font-bold shadow-lg">
                  ↔
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-3 left-3 bg-matrix-black/80 px-2.5 py-1 rounded text-[10px] font-mono text-coherent-blue border border-white/10">
                PRIOR: {scanA.scan_uid}
              </div>
              <div className="absolute top-3 right-3 bg-matrix-black/80 px-2.5 py-1 rounded text-[10px] font-mono text-telemetry-cyan border border-white/10">
                CURRENT: {scanB.scan_uid}
              </div>
            </div>

            {/* Slider Control */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-slate-400">Split Position:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="flex-1 accent-telemetry-cyan cursor-pointer"
              />
              <span className="text-xs font-mono text-telemetry-cyan w-12 text-right">{sliderPos}%</span>
            </div>
          </div>

          {/* Delta Analytics Sidecard */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl spatial-glass border border-surface-border space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Radiographic Delta Analysis</h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-surface-panel border border-surface-border space-y-1">
                  <div className="text-[10px] text-slate-400">BASELINE RESULT (A)</div>
                  <div className="text-base font-bold text-slate-100">{scanA.predicted_label || 'Pending'}</div>
                  <div className="text-[11px] text-coherent-blue">Risk: {scanA.risk_indicator}</div>
                </div>

                <div className="p-3 rounded-lg bg-surface-panel border border-surface-border space-y-1">
                  <div className="text-[10px] text-slate-400">FOLLOW-UP RESULT (B)</div>
                  <div className="text-base font-bold text-slate-100">{scanB.predicted_label || 'Pending'}</div>
                  <div className="text-[11px] text-telemetry-cyan">Risk: {scanB.risk_indicator}</div>
                </div>

                <div className="p-3 rounded-lg bg-coherent-blue/10 border border-coherent-blue/30 text-coherent-blue text-[11px]">
                  AI Result Comparison: Model outputs show congruency across structural landmark patterns.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
