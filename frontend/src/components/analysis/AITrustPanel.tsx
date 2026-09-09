import React from 'react';
import { HelpCircle, CheckCircle, Shield, AlertCircle, Info, Sparkles, Layers } from 'lucide-react';
import { AnalysisData } from '../../types';

interface AITrustPanelProps {
  analysis: AnalysisData;
}

export const AITrustPanel: React.FC<AITrustPanelProps> = ({ analysis }) => {
  return (
    <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 space-y-4 shadow-xl select-none">
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        <Sparkles className="w-4 h-4 text-telemetry-cyan" />
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
          AI Trust & Decision Provenance Panel
        </h3>
      </div>

      <div className="space-y-3 text-xs font-mono">
        <div className="bg-matrix-black p-3 rounded-lg border border-surface-border space-y-2">
          <span className="text-[10px] text-slate-500 uppercase block font-bold">
            WHY DID THE AI PRODUCE THIS FINDING?
          </span>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            The ResNet-50 convolution filters detected high spatial feature activation corresponding to parenchymal opacities in the lower pulmonary zone with <b>{(analysis.confidence_score * 100).toFixed(1)}%</b> confidence.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-matrix-black p-2.5 rounded border border-surface-border">
            <span className="text-[10px] text-slate-500 block">MODEL LINEAGE</span>
            <span className="font-bold text-slate-200">{analysis.model_name} (v{analysis.model_version})</span>
          </div>
          <div className="bg-matrix-black p-2.5 rounded border border-surface-border">
            <span className="text-[10px] text-slate-500 block">EXPLANATION METHOD</span>
            <span className="font-bold text-telemetry-cyan">Grad-CAM++ Saliency</span>
          </div>
          <div className="bg-matrix-black p-2.5 rounded border border-surface-border">
            <span className="text-[10px] text-slate-500 block">INFERENCE LATENCY</span>
            <span className="font-bold text-slate-200">{analysis.inference_time_ms} ms</span>
          </div>
          <div className="bg-matrix-black p-2.5 rounded border border-surface-border">
            <span className="text-[10px] text-slate-500 block">ENTROPY BOUND</span>
            <span className="font-bold text-emerald-400">{analysis.entropy.toFixed(3)} nats</span>
          </div>
        </div>

        <div className="bg-surface-panel/40 p-3 rounded-lg border border-surface-border/60 text-[11px] space-y-1 text-slate-400 font-sans leading-relaxed">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold font-mono text-[10px] uppercase">
            <Info className="w-3.5 h-3.5 text-telemetry-cyan" />
            Clinical Boundary Limitations
          </div>
          <p>
            This system functions as a secondary screening and triage decision-support tool. It is not approved for autonomous primary diagnosis. Clinical correlation by a licensed medical practitioner is required.
          </p>
        </div>
      </div>
    </div>
  );
};
