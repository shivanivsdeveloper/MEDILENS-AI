import React, { useState, useEffect } from 'react';
import {
  HeartPulse, Cpu, HardDrive, Database, ShieldCheck,
  RefreshCw, CheckCircle2, Lock, Zap
} from 'lucide-react';
import { api } from '../api/client';
import { SystemHealthData } from '../types';
import { Language, translations } from '../i18n/translations';

export const SystemHealthPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading || !health) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-telemetry-cyan animate-spin" />
        <div className="text-xs font-mono text-slate-400">POLLING HARDWARE SENSORS...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-telemetry-cyan" />
            <span>System Telemetry & Hardware Governance</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time node health, compute acceleration status, local filesystem capacity, and security controls.
          </p>
        </div>

        <button
          onClick={loadHealth}
          className="p-2.5 rounded-xl bg-surface-card border border-surface-border text-slate-400 hover:text-slate-100"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Health KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Node Status */}
        <div className="p-5 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Platform Status</span>
            <CheckCircle2 className="w-4 h-4 text-clinical-green" />
          </div>
          <div className="text-xl font-bold font-mono text-clinical-green flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-clinical-green animate-pulse" />
            {health.status}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            v{health.version} ({health.environment})
          </div>
        </div>

        {/* Compute Engine */}
        <div className="p-5 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Compute Backend</span>
            <Cpu className="w-4 h-4 text-telemetry-cyan" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-100 truncate">
            {health.compute_device}
          </div>
          <div className="text-[11px] font-mono text-coherent-blue mt-1">
            PyTorch {health.pytorch_version}
          </div>
        </div>

        {/* Storage Capacity */}
        <div className="p-5 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Local Storage</span>
            <HardDrive className="w-4 h-4 text-synaptic-indigo" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">
            {health.storage.free_gb} <span className="text-xs font-normal text-slate-400">GB Free</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {health.storage.used_pct}% utilized of {health.storage.total_gb} GB
          </div>
        </div>

        {/* Local Security Enclave */}
        <div className="p-5 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Privacy Mode</span>
            <ShieldCheck className="w-4 h-4 text-clinical-green" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-100">
            Air-Gapped / Offline
          </div>
          <div className="text-[11px] font-mono text-clinical-green mt-1">
            Zero External API Calls
          </div>
        </div>
      </div>

      {/* Extended Telemetry & Governance Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-coherent-blue" />
            <span>Infrastructure & Subsystem Registry</span>
          </h2>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-surface-panel border border-surface-border/50">
              <span className="text-slate-400">Operating Host:</span>
              <span className="text-slate-200">{health.platform}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-panel border border-surface-border/50">
              <span className="text-slate-400">Python Runtime:</span>
              <span className="text-slate-200">{health.python_runtime}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-panel border border-surface-border/50">
              <span className="text-slate-400">Database Engine:</span>
              <span className="text-slate-200">{health.database_status}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-surface-panel border border-surface-border/50">
              <span className="text-slate-400">Inference Mode:</span>
              <span className="text-telemetry-cyan font-bold">{health.inference_engine}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-telemetry-cyan" />
            <span>HIPAA & GDPR Privacy Compliance Enclave</span>
          </h2>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-2.5 rounded bg-clinical-green/10 border border-clinical-green/20 text-clinical-green flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Full local execution. Medical images never leave local storage.</span>
            </div>
            <div className="p-2.5 rounded bg-surface-panel border border-surface-border text-slate-300">
              • De-identified patient referencing with optional pseudonyms.
            </div>
            <div className="p-2.5 rounded bg-surface-panel border border-surface-border text-slate-300">
              • Deterministic tamper-evident audit trail on all operations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
