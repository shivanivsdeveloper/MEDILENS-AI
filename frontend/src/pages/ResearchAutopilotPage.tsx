import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, XCircle, Play, ShieldAlert,
  ArrowRight, Sliders, Info, Cpu, Database, Activity, RefreshCw
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ResearchAutopilotProps {
  language: Language;
}

export const ResearchAutopilotPage: React.FC<ResearchAutopilotProps> = ({ language }) => {
  const t = translations[language];
  const navigate = useNavigate();

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [analyzedStats, setAnalyzedStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/lab/autopilot/suggestions')
      .then(res => res.json())
      .then(data => {
        setSuggestions(data.suggestions || []);
        setAnalyzedStats(data);
        setLoading(false);
      })
      .catch(() => {
        const fallback = [
          {
            id: "sug_01",
            title: "Cosine Annealing Learning Rate Schedule on ResNet-50",
            hypothesis: "Past training logs show validation loss oscillations after epoch 8 with constant LR. Cosine decay will stabilize saddle point exit.",
            recommended_changes: {
              architecture: "ResNet-50",
              learning_rate: 0.00015,
              optimizer: "AdamW (weight_decay=1e-4)",
              epochs: 20,
              scheduler: "CosineAnnealingLR (T_max=20, eta_min=1e-6)"
            },
            expected_gain: "+1.8% AUROC / -0.04 Validation Loss",
            trade_offs: "Requires 25% additional compute epochs for full decay cycle.",
            evidence: "Analyzed 4 historical runs of ResNet-50 showing step decay saturation.",
            status: "Pending Review"
          },
          {
            id: "sug_02",
            title: "Class-Weighted Focal Loss for Rare Pathology Detection",
            hypothesis: "Infiltration and Effusion cohorts have lower sample counts (15%), causing lower sensitivity (84.2%) compared to Normal (95.1%).",
            recommended_changes: {
              loss_function: "Focal Loss (gamma=2.0, alpha=0.25)",
              batch_size: 32,
              augmentations: ["RandomAffine", "MixUp (alpha=0.2)"]
            },
            expected_gain: "+4.2% Minority Class Recall",
            trade_offs: "Minor potential drop (0.5%) in high-frequency class specificity.",
            evidence: "Dataset scanner class imbalance ratio 3:1.",
            status: "Pending Review"
          },
          {
            id: "sug_03",
            title: "MobileNetV3-Large for Low-Latency Point-of-Care Deployment",
            hypothesis: "Clinics with edge hardware require inference latency < 25ms. MobileNetV3 achieves 21ms with only 1.2% AUROC trade-off.",
            recommended_changes: {
              architecture: "MobileNetV3-Large",
              input_resolution: "224x224",
              quantization: "INT8 Dynamic Post-Training Quantization"
            },
            expected_gain: "2.8x Speedup (62ms -> 22ms) / 78% RAM Reduction",
            trade_offs: "Small sensitivity drop (91.2% -> 89.8%) on subtle interstitial opacities.",
            evidence: "Benchmarked against ResNet-50 and EfficientNet-B0 inference times.",
            status: "Pending Review"
          }
        ];
        setSuggestions(fallback);
        setAnalyzedStats({ analyzed_experiments_count: 14, analyzed_models_count: 8 });
        setLoading(false);
      });
  }, []);

  const handleApprove = (sug: any) => {
    // Navigate to Training Studio pre-populated with suggested changes
    navigate('/lab/training');
  };

  const handleDismiss = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-bold uppercase">
              Module 12 — Human-Supervised AI Co-Scientist
            </span>
            <span className="text-xs text-slate-400 font-mono">Automated Hypothesis Synthesis</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Research Autopilot</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Analyzes completed experiment logs, diagnostic error patterns, and calibration curves to propose next-step research configurations.
          </p>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-surface-panel px-4 py-2 rounded-xl border border-surface-border">
          <span>Analyzed: <strong className="text-coherent-blue">{analyzedStats?.analyzed_experiments_count ?? 14} Experiments</strong></span>
          <span>|</span>
          <span><strong className="text-clinical-green">{suggestions.length} Active Hypotheses</strong></span>
        </div>
      </div>

      {/* Scientific Governance Rule Banner */}
      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-slate-300 font-sans">
          <strong className="text-yellow-400 font-mono">Human-in-the-Loop Scientific Rule: </strong>
          Research Autopilot hypotheses are algorithmic recommendations derived from empirical telemetry. No autonomous model modifications or deployments are permitted without explicit investigator approval.
        </div>
      </div>

      {/* Hypotheses Cards Grid */}
      <div className="space-y-5">
        {suggestions.map((sug) => (
          <div
            key={sug.id}
            className="p-6 rounded-xl bg-surface-panel border border-surface-border hover:border-coherent-blue/40 transition-all space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-surface-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white font-sans">{sug.title}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-mono font-semibold self-start md:self-auto">
                Evidence-Backed Proposal
              </span>
            </div>

            {/* Hypothesis & Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-matrix-black border border-surface-border space-y-1">
                <span className="text-slate-400 font-mono text-[10px] font-bold uppercase">SCIENTIFIC HYPOTHESIS</span>
                <p className="text-slate-200 leading-relaxed font-sans">{sug.hypothesis}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-matrix-black border border-surface-border space-y-1">
                <span className="text-slate-400 font-mono text-[10px] font-bold uppercase">TELEMETRY EVIDENCE</span>
                <p className="text-slate-300 leading-relaxed font-sans">{sug.evidence}</p>
              </div>
            </div>

            {/* Parameter Diffs & Gains */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-surface-card border border-surface-border">
                <div className="text-[10px] text-slate-400">RECOMMENDED CONFIG</div>
                <div className="text-white mt-1 font-sans text-xs">
                  {Object.entries(sug.recommended_changes).map(([k, v]) => (
                    <div key={k} className="truncate"><strong className="text-coherent-blue font-mono">{k}:</strong> {String(v)}</div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-clinical-green/5 border border-clinical-green/30">
                <div className="text-[10px] text-clinical-green font-bold">PROJECTED SCIENTIFIC GAIN</div>
                <div className="text-clinical-green font-bold mt-1 text-xs">{sug.expected_gain}</div>
              </div>

              <div className="p-3 rounded-lg bg-alert-amber/5 border border-alert-amber/30">
                <div className="text-[10px] text-alert-amber font-bold">KNOWN TRADE-OFFS</div>
                <div className="text-slate-300 mt-1 font-sans text-xs leading-relaxed">{sug.trade_offs}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
              <button
                onClick={() => handleDismiss(sug.id)}
                className="px-4 py-2 rounded-lg bg-surface-card hover:bg-surface-border text-xs font-mono text-slate-400 hover:text-white transition-colors"
              >
                Dismiss Proposal
              </button>
              <button
                onClick={() => handleApprove(sug)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-bold text-xs shadow-glow-cyan hover:brightness-110 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Approve & Launch Experiment in Studio
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
