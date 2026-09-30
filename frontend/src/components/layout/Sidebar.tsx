import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, UploadCloud, Microscope, GitCompare,
  ClipboardCheck, Users, FileText, Cpu, Database, FlaskConical,
  Scale, ShieldCheck, HeartPulse, Orbit, Gavel, Activity, Zap,
  PenTool, Eye, ShieldAlert, Layers, Compass, GitBranch, Sparkles,
  Sliders, Sparkle, Heart, Stethoscope, Building2, UserCheck
} from 'lucide-react';
import { Language, translations } from '../../i18n/translations';

interface SidebarProps {
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ language }) => {
  const t = translations[language];

  const navGroups = [
    {
      title: "ROLE PORTALS (NEW)",
      items: [
        { path: "/patient/dashboard", label: "Patient Portal (Simple Mode)", icon: Heart, highlight: true },
        { path: "/doctor/worklist", label: "Doctor Urgent Worklist", icon: Stethoscope, highlight: true },
        { path: "/scan-center/dashboard", label: "Scan Center Facility", icon: Building2, highlight: true },
        { path: "/admin/governance", label: "Admin & Approvals", icon: ShieldAlert, highlight: true },
      ]
    },
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
        { path: "/annotation-studio", label: "Annotation Studio", icon: PenTool },
        { path: "/digital-twin", label: "Digital Twin & Trajectory", icon: Activity },
      ]
    },
    {
      title: "MEDISCAN AI LAB (14 RESEARCH MODULES)",
      items: [
        { path: "/lab", label: "Lab Dashboard", icon: LayoutDashboard },
        { path: "/lab/training", label: "Model Training Studio", icon: Cpu },
        { path: "/lab/model-court", label: "Model Court / Arena", icon: Gavel },
        { path: "/lab/explainability", label: "Explainability Lab", icon: Eye },
        { path: "/lab/trust-failure", label: "Trust & Failure Lab", icon: ShieldAlert },
        { path: "/lab/segmentation", label: "Segmentation Lab", icon: Layers },
        { path: "/lab/pattern-discovery", label: "Pattern Discovery", icon: Compass },
        { path: "/lab/similar-cases", label: "Similar-Case Intelligence", icon: GitBranch },
        { path: "/lab/stress-test", label: "AI Stress-Test Arena", icon: Zap },
        { path: "/lab/dataset-scanner", label: "Dataset Quality Scanner", icon: Database },
        { path: "/lab/experiments", label: "Experiment Studio", icon: FlaskConical },
        { path: "/lab/autopilot", label: "Research Autopilot", icon: Sparkles },
        { path: "/lab/model-registry", label: "Model Registry & Cards", icon: Sliders },
        { path: "/lab/advanced-tools", label: "Advanced Research Tools", icon: Sparkle },
        { path: "/bias-fairness", label: "Demographic Fairness", icon: Scale },
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
    <aside className="w-64 border-r border-surface-border bg-clinical-dark/95 flex flex-col justify-between shrink-0 p-4 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 mb-2 flex items-center justify-between">
              <span>{group.title}</span>
              {group.title.includes("ROLE") ? (
                <span className="w-1.5 h-1.5 rounded-full bg-clinical-green animate-pulse" />
              ) : group.title.includes("RESEARCH") ? (
                <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan animate-ping" />
              ) : null}
            </div>
            <nav className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/' || item.path === '/lab'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-coherent-blue/20 to-telemetry-cyan/10 text-telemetry-cyan border border-coherent-blue/30 shadow-glow-cyan font-bold'
                        : item.highlight
                        ? 'text-slate-300 hover:text-white hover:bg-surface-card/70 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-card/60'
                    }`
                  }
                >
                  <item.icon className={`w-4 h-4 shrink-0 ${item.highlight ? 'text-coherent-blue' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Offline Status Badge */}
      <div className="pt-4 mt-6 border-t border-surface-border">
        <div className="bg-matrix-black/80 rounded-lg p-3 border border-surface-border">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-clinical-green animate-pulse" />
              5 ROLES ACTIVE
            </span>
            <span className="text-telemetry-cyan font-bold">14 MODULES</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Role-based authorization & clinical decision support active.
          </div>
        </div>
      </div>
    </aside>
  );
};
