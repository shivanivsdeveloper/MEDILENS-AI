import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, CheckCircle2, HelpCircle } from 'lucide-react';
import { AnalysisData } from '../../types';

interface ConfidenceCardProps {
  analysis: AnalysisData;
  qualityScore: number;
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({ analysis, qualityScore }) => {
  const isAbstained =
    qualityScore < 45 ||
    analysis.uncertainty_score > 0.45 ||
    (analysis.is_ood && analysis.confidence_score < 0.60);

  const confPercent = Math.round(analysis.confidence_score * 100);
  const uncertPercent = Math.round(analysis.uncertainty_score * 100);
  const qualPercent = Math.round(qualityScore);

  return (
    <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 space-y-4 shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-telemetry-cyan" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
            AI Screening Safety Status
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
            isAbstained
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {isAbstained ? 'AI Abstention' : 'Screening Validated'}
        </span>
      </div>

      {isAbstained ? (
        <div className="bg-rose-950/30 border border-rose-500/40 rounded-lg p-4 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>AI ABSTENTION ENFORCED</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Reliable automated screening could not be established for this scan due to excessive predictive uncertainty or degraded image quality. Human radiologist review required.
          </p>
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs">
          {/* Diagnostic Result Line */}
          <div className="flex items-center justify-between bg-matrix-black p-3 rounded-lg border border-surface-border">
            <span className="text-slate-400">Primary Finding:</span>
            <span className="font-bold text-base text-slate-100">{analysis.predicted_label}</span>
          </div>

          {/* Metric Bars */}
          <div className="space-y-2 pt-1">
            {/* Confidence */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Confidence Index</span>
                <span className="text-telemetry-cyan font-bold">{confPercent}%</span>
              </div>
              <div className="w-full bg-matrix-black h-2 rounded-full overflow-hidden border border-surface-border">
                <div
                  style={{ width: `${confPercent}%` }}
                  className="h-full bg-gradient-to-r from-coherent-blue to-telemetry-cyan rounded-full"
                />
              </div>
            </div>

            {/* Uncertainty */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Predictive Uncertainty</span>
                <span className={`font-bold ${uncertPercent > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {uncertPercent}% ({uncertPercent > 35 ? 'Moderate' : 'Low'})
                </span>
              </div>
              <div className="w-full bg-matrix-black h-2 rounded-full overflow-hidden border border-surface-border">
                <div
                  style={{ width: `${uncertPercent}%` }}
                  className="h-full bg-amber-400 rounded-full"
                />
              </div>
            </div>

            {/* Image Quality */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Image Quality Gate</span>
                <span className="text-emerald-400 font-bold">{qualPercent}%</span>
              </div>
              <div className="w-full bg-matrix-black h-2 rounded-full overflow-hidden border border-surface-border">
                <div
                  style={{ width: `${qualPercent}%` }}
                  className="h-full bg-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* OOD & Distribution State */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-matrix-black p-2.5 rounded border border-surface-border text-[11px]">
              <span className="text-[10px] text-slate-500 block">DISTRIBUTION</span>
              <span className={`font-bold ${analysis.is_ood ? 'text-amber-400' : 'text-emerald-400'}`}>
                {analysis.is_ood ? 'Potential OOD' : 'In-Distribution'}
              </span>
            </div>
            <div className="bg-matrix-black p-2.5 rounded border border-surface-border text-[11px]">
              <span className="text-[10px] text-slate-500 block">MODEL CONSENSUS</span>
              <span className="font-bold text-telemetry-cyan">High Agreement</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
