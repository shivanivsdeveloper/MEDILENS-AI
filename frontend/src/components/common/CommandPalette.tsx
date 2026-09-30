import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Orbit, Scale, Activity, Zap, PenTool, LayoutDashboard,
  UploadCloud, Microscope, Users, Cpu, Database, X, ChevronRight, FileText,
  Eye, ShieldAlert, Layers, Compass, GitBranch, Sparkles, Sliders, Sparkle, FlaskConical
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    // Clinical Workstation
    { label: 'Clinical Dashboard', path: '/', category: 'Workstation', icon: LayoutDashboard },
    { label: 'Scan Ingestion & Triage', path: '/scans/upload', category: 'Workstation', icon: UploadCloud },
    { label: 'Multi-View AI Analysis & 3D GradCAM', path: '/analysis', category: 'Workstation', icon: Microscope },
    { label: 'Longitudinal Comparison', path: '/compare', category: 'Workstation', icon: Activity },
    { label: 'Human-in-the-Loop Review Queue', path: '/reviews', category: 'Workstation', icon: FileText },
    { label: 'Patient Directory', path: '/patients', category: 'Workstation', icon: Users },
    { label: 'Diagnostic PDF Reports Hub', path: '/reports', category: 'Workstation', icon: FileText },
    { label: 'Clinical Annotation Studio', path: '/annotation-studio', category: 'Workstation', icon: PenTool },
    { label: 'Patient Digital Twin & Progression', path: '/digital-twin', category: 'Workstation', icon: Activity },

    // MediScan AI Lab
    { label: 'MediScan AI Lab Dashboard', path: '/lab', category: 'AI Lab', icon: LayoutDashboard },
    { label: 'Model Training Studio (PyTorch CNNs)', path: '/lab/training', category: 'AI Lab', icon: Cpu },
    { label: 'Model Court & Consensus Arena', path: '/lab/model-court', category: 'AI Lab', icon: Scale },
    { label: 'Explainability Lab (Multi-Method Saliency)', path: '/lab/explainability', category: 'AI Lab', icon: Eye },
    { label: 'Trust & Failure Lab (ECE & Abstention)', path: '/lab/trust-failure', category: 'AI Lab', icon: ShieldAlert },
    { label: 'Lesion Segmentation Lab (U-Net)', path: '/lab/segmentation', category: 'AI Lab', icon: Layers },
    { label: 'Hidden Pattern Discovery (PCA/t-SNE)', path: '/lab/pattern-discovery', category: 'AI Lab', icon: Compass },
    { label: 'Similar-Case Intelligence (Cosine Search)', path: '/lab/similar-cases', category: 'AI Lab', icon: GitBranch },
    { label: 'AI Stress-Test Robustness Arena', path: '/lab/stress-test', category: 'AI Lab', icon: Zap },
    { label: 'Dataset Quality & Leakage Scanner', path: '/lab/dataset-scanner', category: 'AI Lab', icon: Database },
    { label: 'Experiment Studio & HPO Tuning', path: '/lab/experiments', category: 'AI Lab', icon: FlaskConical },
    { label: 'Research Autopilot (AI Co-Scientist)', path: '/lab/autopilot', category: 'AI Lab', icon: Sparkles },
    { label: 'Model Registry & Model Cards', path: '/lab/model-registry', category: 'AI Lab', icon: Sliders },
    { label: 'Advanced Research Tools (24 Modules)', path: '/lab/advanced-tools', category: 'AI Lab', icon: Sparkle },
    { label: 'Demographic Bias & Subgroup Fairness', path: '/bias-fairness', category: 'AI Lab', icon: Scale },

    // Governance
    { label: 'System Audit Logs', path: '/audit', category: 'Governance', icon: FileText },
    { label: 'System Telemetry & Health', path: '/health', category: 'Governance', icon: Activity },
  ];

  const filtered = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-matrix-black/80 backdrop-blur-md flex items-start justify-center pt-24 p-4">
      <div className="bg-clinical-dark border border-surface-border rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-surface-border">
          <Search className="w-5 h-5 text-telemetry-cyan shrink-0" />
          <input
            type="text"
            placeholder="Search all 14 research workspaces, tools, or clinical routes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent px-3 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No matching commands or routes found.
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(cmd.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-mono hover:bg-surface-card text-slate-300 hover:text-telemetry-cyan transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <cmd.icon className="w-4 h-4 text-slate-500 group-hover:text-telemetry-cyan transition-colors" />
                  <span className="font-medium text-slate-200 group-hover:text-white">{cmd.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 uppercase bg-matrix-black px-2 py-0.5 rounded border border-surface-border">
                    {cmd.category}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-telemetry-cyan" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="bg-matrix-black/80 px-4 py-2 border-t border-surface-border text-[10px] font-mono text-slate-500 flex justify-between">
          <span>Search 14 AI Lab Research Modules + Clinical Workstation</span>
          <span>Use <b>ESC</b> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
