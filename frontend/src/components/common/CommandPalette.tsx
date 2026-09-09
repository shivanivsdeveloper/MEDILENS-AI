import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Orbit, Scale, Activity, Zap, PenTool, LayoutDashboard,
  UploadCloud, Microscope, Users, Cpu, Database, X, ChevronRight, FileText
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    { label: 'Clinical Dashboard', path: '/', category: 'Workstation', icon: LayoutDashboard },
    { label: 'Scan Ingestion & Triage', path: '/scans/upload', category: 'Workstation', icon: UploadCloud },
    { label: 'Multi-View AI Analysis', path: '/analysis', category: 'Workstation', icon: Microscope },
    { label: 'Embedding Universe 3D Manifold', path: '/embedding-universe', category: 'Research Labs', icon: Orbit },
    { label: 'Model Courtroom Debate', path: '/model-court', category: 'Research Labs', icon: Scale },
    { label: 'Patient Digital Twin & Progression', path: '/digital-twin', category: 'Research Labs', icon: Activity },
    { label: 'AI Stress-Test Robustness Arena', path: '/stress-test', category: 'Research Labs', icon: Zap },
    { label: 'Clinical Annotation Studio', path: '/annotation-studio', category: 'Research Labs', icon: PenTool },
    { label: 'Model Registry & Benchmark Lab', path: '/models', category: 'Research Labs', icon: Cpu },
    { label: 'Dataset Explorer & Leakage Lab', path: '/datasets', category: 'Research Labs', icon: Database },
    { label: 'Patient Longitudinal Registry', path: '/patients', category: 'Workstation', icon: Users },
    { label: 'Clinical Diagnostic Reports', path: '/reports', category: 'Workstation', icon: FileText },
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
        else {
          // Open
        }
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
            placeholder="Type a command, tool or screen name..."
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
          <span>Navigation Shortcuts</span>
          <span>Use <b>ESC</b> to dismiss</span>
        </div>
      </div>
    </div>
  );
};
