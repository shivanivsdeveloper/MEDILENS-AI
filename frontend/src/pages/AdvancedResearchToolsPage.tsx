import React, { useState, useEffect } from 'react';
import {
  Sparkle, ShieldCheck, AlertCircle, CheckCircle2, Play,
  Sliders, Info, Cpu, Database, Layers, Eye, RefreshCw, Terminal
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface AdvancedToolsProps {
  language: Language;
}

export const AdvancedResearchToolsPage: React.FC<AdvancedToolsProps> = ({ language }) => {
  const t = translations[language];

  const [toolsData, setToolsData] = useState<any>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedTool, setSelectedTool] = useState<any>(null);

  const toolsList = [
    { id: "few_shot", name: "Few-Shot Prototypical Learning", category: "Training", status: "Ready", desc: "Train support vectors for rare pathologies with as few as 5 labelled samples.", pre: "5 annotated samples per target class" },
    { id: "self_supervised", name: "Self-Supervised SimCLR Pretraining", category: "Training", status: "Ready", desc: "Contrastive representation learning on unannotated institutional archive images.", pre: "Unlabelled DICOM/PNG folder" },
    { id: "active_learning", name: "Active Learning & Uncertainty Triage", category: "Training", status: "Ready", desc: "Select high-entropy, high-variance cases for prioritized expert radiologist annotation.", pre: "Review queue backlog" },
    { id: "counterfactual", name: "Counterfactual Saliency Generation", category: "Explainability", status: "Ready", desc: "Generates minimal perturbation transforms to simulate condition transitions (e.g. Normal → Consolidation).", pre: "Latent autoencoder weights" },
    { id: "drift_monitoring", name: "Longitudinal KS Feature Drift Monitor", category: "Governance", status: "Ready", desc: "Kolmogorov-Smirnov two-sample test monitoring covariate shift across temporal patient batches.", pre: "Rolling window of 50 consecutive scans" },
    { id: "model_compression", name: "INT8 TensorRT / ONNX Quantization", category: "Deployment", status: "Needs GPU Acceleration", desc: "Post-training integer quantization to compress weights by 75% for edge deployment.", pre: "CUDA Runtime & ONNX Export" },
    { id: "cross_validation", name: "5-Fold Stratified Patient Cross-Validation", category: "Evaluation", status: "Ready", desc: "Rigorous 5-fold cross-validation guaranteeing zero patient overlap between folds.", pre: "Annotated patient dataset" },
    { id: "fairness_audit", name: "Demographic Parity & Subgroup Calibration", category: "Governance", status: "Ready", desc: "Evaluate equalized odds, predictive parity, and calibration across age & biological sex cohorts.", pre: "Demographic patient metadata" },
    { id: "federated_sim", name: "Federated Averaging (FedAvg) Simulation", category: "Research", status: "Ready", desc: "Simulate privacy-preserving decentralized weight updates across multiple hospital nodes.", pre: "Multi-client configuration" },
    { id: "continual_learning", name: "Elastic Weight Consolidation (EWC)", category: "Training", status: "Ready", desc: "Prevents catastrophic forgetting when fine-tuning across sequential clinical modalities.", pre: "Fisher Information Matrix calculation" },
    { id: "synthetic_data", name: "Diffusion-Based Synthetic Lesion Synthesis", category: "Research", status: "Needs GPU Acceleration", desc: "Conditioned diffusion synthesis of rare thoracic opacities for data augmentation.", pre: "Stable Diffusion medical checkpoint" },
    { id: "benchmark_arena", name: "CPU/GPU Hardware Latency Profiler", category: "Deployment", status: "Ready", desc: "Measures tensor memory allocations, floating-point ops, and single-scan forward latency.", pre: "PyTorch benchmark suite" }
  ];

  const filteredTools = filter === 'ALL' ? toolsList : toolsList.filter(t => t.category === filter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 font-bold uppercase">
              Module 14 — Specialized Research Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">24 Scientific Capabilities</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Advanced Research Tools</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Specialized scientific tooling for self-supervised learning, active triage, drift monitoring, and continual adaptation.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Training', 'Explainability', 'Evaluation', 'Governance', 'Deployment', 'Research'].map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filter === c
                  ? 'bg-fuchsia-500 text-white font-bold shadow-lg'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setSelectedTool(tool)}
            className="p-5 rounded-xl bg-surface-panel border border-surface-border hover:border-fuchsia-500/50 cursor-pointer transition-all flex flex-col justify-between space-y-4 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-card border border-surface-border text-slate-400">
                  {tool.category}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  tool.status === 'Ready'
                    ? 'bg-clinical-green/10 text-clinical-green border border-clinical-green/30'
                    : 'bg-alert-amber/10 text-alert-amber border border-alert-amber/30'
                }`}>
                  {tool.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-sans">{tool.name}</h3>
              <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">{tool.desc}</p>
            </div>

            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Prereq: {tool.pre.slice(0, 24)}...</span>
              <span className="text-fuchsia-400 font-bold">Inspect →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tool Inspection Modal / Drawer */}
      {selectedTool && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full rounded-2xl bg-clinical-dark border border-fuchsia-500/40 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-fuchsia-400" />
                <h3 className="text-base font-bold text-white font-sans">{selectedTool.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTool(null)}
                className="text-slate-400 hover:text-white font-mono text-xs px-2 py-1 bg-surface-card rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-surface-panel border border-surface-border space-y-1">
                <div className="text-slate-500 text-[10px]">SCIENTIFIC PURPOSE</div>
                <div className="text-slate-200 font-sans text-xs leading-relaxed">{selectedTool.desc}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-surface-panel border border-surface-border">
                  <div className="text-slate-500 text-[10px]">READINESS STATUS</div>
                  <div className="text-clinical-green font-bold text-sm mt-0.5">{selectedTool.status}</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-panel border border-surface-border">
                  <div className="text-slate-500 text-[10px]">REQUIRED PREREQUISITES</div>
                  <div className="text-coherent-blue font-bold text-xs mt-0.5">{selectedTool.pre}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-matrix-black border border-surface-border font-mono text-[11px] text-slate-400">
                Integration path: Initialized via institutional configuration endpoint <code>/api/v1/lab/advanced-tools/{selectedTool.id}</code>.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedTool(null)}
                className="px-4 py-2 rounded-lg bg-surface-card hover:bg-surface-border text-slate-300 text-xs font-mono"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
