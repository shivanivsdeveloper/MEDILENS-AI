import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Globe, ShieldAlert, Cpu, Database, UserCheck, Bell
} from 'lucide-react';
import { ECGTelemetryWave } from '../spatial/ECGTelemetryWave';
import { Language, translations } from '../../i18n/translations';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  userRole: string;
  onRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  userRole,
  onRoleChange
}) => {
  const t = translations[language];

  return (
    <header className="h-16 border-b border-surface-border bg-clinical-dark/95 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Safety Notice */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coherent-blue to-telemetry-cyan p-0.5 shadow-glow-cyan flex items-center justify-center">
            <div className="w-full h-full bg-matrix-black rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-telemetry-cyan group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-telemetry-cyan bg-clip-text text-transparent">
                MEDISCAN <span className="text-telemetry-cyan font-mono">AI</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-coherent-blue/15 text-coherent-blue border border-coherent-blue/30 rounded uppercase font-semibold">
                v2.5 Institutional
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight">
              Spatial Decision-Support Workstation
            </div>
          </div>
        </Link>

        {/* Safety Disclaimer Banner */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-alert-amber/10 border border-alert-amber/25 rounded-md text-alert-amber text-[11px] font-mono">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>{t.safety_disclaimer_badge}</span>
        </div>
      </div>

      {/* Right Telemetry & Controls */}
      <div className="flex items-center gap-4">
        {/* ECG Live Telemetry */}
        <div className="hidden md:block">
          <ECGTelemetryWave bpm={74} />
        </div>

        {/* System Health Indicators */}
        <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-matrix-black/60 border border-surface-border text-xs font-mono">
          <div className="flex items-center gap-1.5 text-clinical-green">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI: ONLINE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-coherent-blue">
            <Database className="w-3.5 h-3.5" />
            <span>DB: READY</span>
          </div>
        </div>

        {/* Command Palette Launcher */}
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true });
            window.dispatchEvent(event);
          }}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-surface-card hover:bg-surface-border rounded-lg border border-surface-border text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
          title="Open Command Palette (Ctrl+K)"
        >
          <span>Search</span>
          <kbd className="px-1.5 py-0.5 text-[9px] bg-matrix-black border border-surface-border rounded text-telemetry-cyan font-bold">
            Ctrl+K
          </kbd>
        </button>

        {/* Role Selector */}
        <div className="flex items-center gap-1 bg-surface-card px-2.5 py-1 rounded-lg border border-surface-border text-xs font-mono">
          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={userRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            <option value="Lead Radiologist" className="bg-slate-900">Lead Radiologist</option>
            <option value="Clinical Reviewer" className="bg-slate-900">Clinical Reviewer</option>
            <option value="Research Fellow" className="bg-slate-900">Research Fellow</option>
            <option value="System Admin" className="bg-slate-900">System Admin</option>
          </select>
        </div>

        {/* Language Toggle (English / Tamil) */}
        <button
          onClick={() => onLanguageChange(language === 'en' ? 'ta' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-card border border-coherent-blue/30 text-xs font-mono text-coherent-blue hover:bg-coherent-blue/10 transition-colors"
          title="Switch Language (English / Tamil)"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-semibold">{language === 'en' ? 'தமிழ்' : 'English'}</span>
        </button>
      </div>
    </header>
  );
};
