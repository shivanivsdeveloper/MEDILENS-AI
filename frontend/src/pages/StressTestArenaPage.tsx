import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Sliders, ShieldCheck, AlertTriangle, ShieldAlert,
  Play, RefreshCw, Layers, CheckCircle, XCircle, Gauge, Cpu
} from 'lucide-react';
import { api, getStaticUrl } from '../api/client';
import { ScanItem, StressTestResult } from '../types';
import { Language } from '../i18n/translations';

interface StressTestArenaPageProps {
  language: Language;
}

export const StressTestArenaPage: React.FC<StressTestArenaPageProps> = () => {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Perturbation parameter sliders
  const [noiseSeverity, setNoiseSeverity] = useState(0.4);
  const [blurSeverity, setBlurSeverity] = useState(0.5);
  const [contrastSeverity, setContrastSeverity] = useState(0.5);
  const [brightnessSeverity, setBrightnessSeverity] = useState(0.5);
  const [compressionSeverity, setCompressionSeverity] = useState(0.6);
  const [resolutionSeverity, setResolutionSeverity] = useState(0.5);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const list = await api.listScans();
        setScans(list);
        if (list.length > 0) {
          setSelectedScanId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchScans();
  }, []);

  const handleRunStressTest = async () => {
    if (!selectedScanId) return;
    setLoading(true);
    try {
      const perturbations = [
        { type: 'gaussian_noise', severity: noiseSeverity },
        { type: 'blur', severity: blurSeverity },
        { type: 'contrast', severity: contrastSeverity },
        { type: 'brightness', severity: brightnessSeverity },
        { type: 'compression', severity: compressionSeverity },
        { type: 'resolution', severity: resolutionSeverity }
      ];

      const res = await api.runStressTest(selectedScanId, 'mod_chest_xray_v2', perturbations);
      setStressResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedScanId) {
      handleRunStressTest();
    }
  }, [selectedScanId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/30 uppercase font-bold">
              Model Robustness & Perturbation Arena
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Zap className="w-3.5 h-3.5 text-telemetry-cyan" />
              Controlled Image Degradation Testing
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-telemetry-cyan" />
            AI Stress-Test Arena
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Stress-test neural network models against real-world acquisition noise, sensor blur, contrast fluctuations, and compression artifacts to measure prediction invariance.
          </p>
        </div>

        {/* Scan Selector & Launch */}
        <div className="flex items-center gap-2">
          <select
            value={selectedScanId || ''}
            onChange={(e) => setSelectedScanId(Number(e.target.value))}
            className="bg-clinical-dark border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-telemetry-cyan font-mono"
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} - {s.detected_modality}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunStressTest}
            disabled={loading || !selectedScanId}
            className="flex items-center gap-1.5 px-4 py-2 bg-coherent-blue hover:bg-coherent-blue/80 text-white text-xs font-bold rounded-lg transition-all shadow-glow-cyan"
          >
            <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Suite
          </button>
        </div>
      </div>

      {/* Perturbation Parameter Sliders Panel */}
      <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
            <Sliders className="w-4 h-4 text-telemetry-cyan" />
            Perturbation Severity Controls
          </span>
          <span className="text-[10px] font-mono text-slate-500">Continuous Parameter Space (0.0 - 1.0)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs font-mono">
          <div className="space-y-1.5 bg-matrix-black p-3 rounded-lg border border-surface-border">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Gaussian Noise</span>
              <span className="text-telemetry-cyan font-bold">{noiseSeverity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={noiseSeverity}
              onChange={(e) => setNoiseSeverity(parseFloat(e.target.value))}
              className="w-full accent-telemetry-cyan h-1 bg-surface-border rounded"
            />
          </div>

          <div className="space-y-1.5 bg-matrix-black p-3 rounded-lg border border-surface-border">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Motion Blur</span>
              <span className="text-telemetry-cyan font-bold">{blurSeverity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={blurSeverity}
              onChange={(e) => setBlurSeverity(parseFloat(e.target.value))}
              className="w-full accent-telemetry-cyan h-1 bg-surface-border rounded"
            />
          </div>

          <div className="space-y-1.5 bg-matrix-black p-3 rounded-lg border border-surface-border">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Contrast Shift</span>
              <span className="text-telemetry-cyan font-bold">{contrastSeverity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={contrastSeverity}
              onChange={(e) => setContrastSeverity(parseFloat(e.target.value))}
              className="w-full accent-telemetry-cyan h-1 bg-surface-border rounded"
            />
          </div>

          <div className="space-y-1.5 bg-matrix-black p-3 rounded-lg border border-surface-border">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Illumination</span>
              <span className="text-telemetry-cyan font-bold">{brightnessSeverity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={brightnessSeverity}
              onChange={(e) => setBrightnessSeverity(parseFloat(e.target.value))}
              className="w-full accent-telemetry-cyan h-1 bg-surface-border rounded"
            />
          </div>

          <div className="space-y-1.5 bg-matrix-black p-3 rounded-lg border border-surface-border">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Compression</span>
              <span className="text-telemetry-cyan font-bold">{compressionSeverity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={compressionSeverity}
              onChange={(e) => setCompressionSeverity(parseFloat(e.target.value))}
              className="w-full accent-telemetry-cyan h-1 bg-surface-border rounded"
            />
          </div>

          <div className="space-y-1.5 bg-matrix-black p-3 rounded-lg border border-surface-border">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Resolution Loss</span>
              <span className="text-telemetry-cyan font-bold">{resolutionSeverity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={resolutionSeverity}
              onChange={(e) => setResolutionSeverity(parseFloat(e.target.value))}
              className="w-full accent-telemetry-cyan h-1 bg-surface-border rounded"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-clinical-dark border border-surface-border rounded-xl p-16 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-telemetry-cyan" />
          <div className="text-xs font-mono text-slate-400">Injecting Perturbations and Evaluating Neural Invariance...</div>
        </div>
      ) : stressResult ? (
        <div className="space-y-6">
          {/* Robustness Profile Banner */}
          <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-coherent-blue/20 rounded-xl text-telemetry-cyan">
                <Gauge className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block">STABILITY SCORE</span>
                <span className="text-2xl font-bold font-mono text-telemetry-cyan">
                  {stressResult.overall_stability_score}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">ROBUSTNESS TIER</span>
              <span className="text-xs font-bold text-slate-200 block mt-1">
                {stressResult.robustness_tier}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">BASELINE PREDICTION</span>
              <span className="text-xs font-bold text-slate-200 font-mono block mt-1">
                {stressResult.baseline_label} ({(stressResult.baseline_confidence * 100).toFixed(1)}%)
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">TESTS PASSED</span>
              <span className="text-xs font-bold text-emerald-400 font-mono block mt-1">
                {stressResult.tests_passed} / {stressResult.tests_evaluated} Invariant
              </span>
            </div>
          </div>

          {/* Perturbation Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stressResult.perturbation_results.map((p, idx) => (
              <div
                key={idx}
                className={`bg-clinical-dark border rounded-xl p-4 space-y-3 shadow-lg ${
                  p.prediction_maintained ? 'border-surface-border' : 'border-rose-500/50 bg-rose-950/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-200">
                    {p.perturbation_type.replace('_', ' ')}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-mono font-bold ${
                      p.prediction_maintained ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {p.prediction_maintained ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> INVARIANT
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> FLIPPED
                      </>
                    )}
                  </span>
                </div>

                <div className="bg-matrix-black rounded-lg aspect-square overflow-hidden border border-surface-border relative">
                  <img
                    src={getStaticUrl(`/static/outputs/${p.perturbed_image_filename}`)}
                    alt="Perturbed Scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-matrix-black/80 border border-surface-border text-slate-300">
                    Sev: {p.severity}
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono bg-matrix-black p-2.5 rounded border border-surface-border">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px]">OUTPUT:</span>
                    <span className={`font-bold ${p.prediction_maintained ? 'text-slate-200' : 'text-rose-400'}`}>
                      {p.perturbed_prediction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px]">CONFIDENCE:</span>
                    <span className="font-bold text-telemetry-cyan">{(p.perturbed_confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-[10px]">CONF DELTA:</span>
                    <span className="text-slate-400">{(p.confidence_delta * 100).toFixed(1)}% shift</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-clinical-dark border border-surface-border rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
          Select a scan and click 'Run Suite' to evaluate adversarial robustness.
        </div>
      )}
    </div>
  );
};
