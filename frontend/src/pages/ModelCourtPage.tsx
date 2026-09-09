import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gavel, Scale, AlertOctagon, CheckCircle2, ShieldAlert,
  Flame, Microscope, RefreshCw, Layers, Brain, FileCheck, ArrowRight
} from 'lucide-react';
import { api } from '../api/client';
import { ScanItem, ModelCourtDebateResult } from '../types';
import { Language } from '../i18n/translations';

interface ModelCourtPageProps {
  language: Language;
}

export const ModelCourtPage: React.FC<ModelCourtPageProps> = () => {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [debateData, setDebateData] = useState<ModelCourtDebateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingScans, setLoadingScans] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      setLoadingScans(true);
      try {
        const list = await api.listScans();
        setScans(list);
        if (list.length > 0) {
          setSelectedScanId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingScans(false);
      }
    };
    fetchScans();
  }, []);

  const handleRunDebate = async (scanId: number) => {
    setSelectedScanId(scanId);
    setLoading(true);
    try {
      const res = await api.runModelCourtDebate(scanId);
      setDebateData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedScanId) {
      handleRunDebate(selectedScanId);
    }
  }, [selectedScanId]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/30 uppercase font-bold">
              Multi-Model Tribunal
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Scale className="w-3.5 h-3.5 text-telemetry-cyan" />
              Comparative Disagreement & Calibration Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Gavel className="w-7 h-7 text-telemetry-cyan" />
            MediScan Model Courtroom
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Independent neural network architectures debate clinical evidence on the same case. Disagreements and variance are transparently exposed without forced consensus.
          </p>
        </div>

        {/* Scan Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedScanId || ''}
            onChange={(e) => setSelectedScanId(Number(e.target.value))}
            className="bg-clinical-dark border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-telemetry-cyan font-mono"
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} - {s.detected_modality} ({s.patient_reference_id || 'Patient'})
              </option>
            ))}
          </select>

          <button
            onClick={() => selectedScanId && handleRunDebate(selectedScanId)}
            disabled={loading || !selectedScanId}
            className="flex items-center gap-1.5 px-3 py-2 bg-coherent-blue hover:bg-coherent-blue/80 text-white text-xs font-bold rounded-lg transition-all shadow-glow-cyan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Convene Court
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-clinical-dark/80 border border-surface-border rounded-xl p-16 flex flex-col items-center justify-center space-y-4 shadow-xl">
          <RefreshCw className="w-10 h-10 animate-spin text-telemetry-cyan" />
          <div className="text-center space-y-1 font-mono">
            <div className="text-sm font-bold text-slate-200">Convening Model Court & Evaluating Evidence...</div>
            <div className="text-xs text-slate-500">Executing ResNet-50, Multi-Scale Attention, and Specialized Modality Backbones</div>
          </div>
        </div>
      ) : debateData ? (
        <div className="space-y-6">
          {/* Tribunal Verdict Summary Banner */}
          <div
            className={`rounded-xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl ${
              debateData.consensus_status === 'UNANIMOUS_CONSENSUS'
                ? 'bg-emerald-950/30 border-emerald-500/30'
                : debateData.consensus_status === 'MAJORITY_CONSENSUS'
                ? 'bg-coherent-blue/10 border-coherent-blue/30'
                : 'bg-rose-950/30 border-rose-500/30'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  debateData.consensus_status === 'UNANIMOUS_CONSENSUS'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : debateData.consensus_status === 'MAJORITY_CONSENSUS'
                    ? 'bg-coherent-blue/20 text-telemetry-cyan'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {debateData.consensus_status === 'UNANIMOUS_CONSENSUS' ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : debateData.consensus_status === 'MAJORITY_CONSENSUS' ? (
                  <Scale className="w-8 h-8" />
                ) : (
                  <AlertOctagon className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Tribunal Consensus Verdict
                </div>
                <h2 className="text-xl font-bold text-slate-100 font-mono">
                  {debateData.consensus_label}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    ({(debateData.agreement_ratio * 100).toFixed(0)}% Agreement • {debateData.majority_votes}/{debateData.total_judges} Judges)
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {debateData.action_recommendation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-surface-border/80 pt-3 md:pt-0 md:pl-6">
              <div>
                <span className="text-[10px] text-slate-500 block">DISPUTE LEVEL</span>
                <span className={`font-bold ${debateData.dispute_level === 'Zero' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {debateData.dispute_level}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">AVG CONFIDENCE</span>
                <span className="font-bold text-telemetry-cyan">{(debateData.average_confidence * 100).toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">VARIANCE</span>
                <span className="font-bold text-slate-300">{debateData.confidence_variance.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Individual Model Opinions Bench */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Brain className="w-4 h-4 text-telemetry-cyan" />
              Independent Model Bench Evidence & Rationales
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {debateData.court_opinions.map((op, idx) => (
                <div
                  key={idx}
                  className="bg-clinical-dark border border-surface-border rounded-xl p-5 space-y-4 hover:border-coherent-blue/50 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-telemetry-cyan font-bold tracking-wide block">
                          BENCH JUDGE #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100">{op.model_name}</h4>
                        <span className="text-[10px] font-mono text-slate-500">{op.architecture} (v{op.version})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-matrix-black border border-surface-border text-slate-300">
                        {op.modality}
                      </span>
                    </div>

                    <div className="bg-matrix-black p-3 rounded-lg border border-surface-border space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[10px]">FINDING:</span>
                        <span className="font-bold text-slate-200">{op.predicted_label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[10px]">CONFIDENCE:</span>
                        <span className="font-bold text-telemetry-cyan">{(op.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[10px]">UNCERTAINTY:</span>
                        <span className={`font-bold ${op.uncertainty > 0.35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {(op.uncertainty * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed italic bg-surface-panel/40 p-2.5 rounded border border-surface-border/50">
                      "{op.key_rationale}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-surface-border flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Stratified Risk:</span>
                    <span
                      className={`font-bold ${
                        op.risk === 'High'
                          ? 'text-rose-400'
                          : op.risk === 'Moderate'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {op.risk} Risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-clinical-dark border border-surface-border rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
          Select a scan to convene the multi-model courtroom tribunal.
        </div>
      )}
    </div>
  );
};
