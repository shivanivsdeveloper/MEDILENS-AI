import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, UploadCloud, Microscope, GitCompare,
  ClipboardCheck, Users, FileText, Cpu, Database, FlaskConical,
  Scale, ShieldCheck, HeartPulse, Orbit, Gavel, Activity, Zap, PenTool
} from 'lucide-react';
import { Language, translations } from '../../i18n/translations';

interface SidebarProps {
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ language }) => {
  const t = translations[language];

  const navGroups = [
    {
      title: "CLINICAL WORKSTATION",
      items: [
        { path: "/", label: t.nav_dashboard, icon: LayoutDashboard },
        { path: "/scans/upload", label: t.nav_scan_center, icon: UploadCloud },
        { path: "/analysis", label: t.nav_ai_analysis, icon: Microscope },
        { path: "/compare", label: t.nav_comparison, icon: GitCompare },
        { path: "/reviews", label: t.nav_review_queue, icon: ClipboardCheck },
        { path: "/patients", label: t.nav_patients, icon: Users },
        { path: "/reports", label: t.nav_reports, icon: FileText },
      ]
    },
    {
      title: "ADVANCED AI RESEARCH LABS",
      items: [
        { path: "/embedding-universe", label: "Embedding Universe", icon: Orbit },
        { path: "/model-court", label: "Model Courtroom", icon: Gavel },
        { path: "/digital-twin", label: "Digital Twin & Trajectory", icon: Activity },
        { path: "/stress-test", label: "AI Stress-Test Arena", icon: Zap },
        { path: "/annotation-studio", label: "Annotation Studio", icon: PenTool },
        { path: "/models", label: t.nav_model_lab, icon: Cpu },
        { path: "/datasets", label: t.nav_datasets, icon: Database },
        { path: "/experiments", label: t.nav_experiments, icon: FlaskConical },
        { path: "/bias-fairness", label: t.nav_bias_fairness, icon: Scale },
      ]
    },
    {
      title: "GOVERNANCE & TELEMETRY",
      items: [
        { path: "/audit", label: t.nav_audit_log, icon: ShieldCheck },
        { path: "/health", label: t.nav_system_health, icon: HeartPulse },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-surface-border bg-clinical-dark/95 flex flex-col justify-between shrink-0 p-4 select-none">
      <div className="space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 mb-2">
              {group.title}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-coherent-blue/20 to-telemetry-cyan/10 text-telemetry-cyan border border-coherent-blue/30 shadow-glow-cyan'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-card/60'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Offline Status Badge */}
      <div className="pt-4 border-t border-surface-border">
        <div className="bg-matrix-black/80 rounded-lg p-3 border border-surface-border">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-clinical-green animate-pulse" />
              OFFLINE READY
            </span>
            <span className="text-telemetry-cyan font-bold">100%</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Local weights & database loaded. Zero external dependency.
          </div>
        </div>
      </div>
    </aside>
  );
};
