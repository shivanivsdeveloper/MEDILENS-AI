import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, ArrowRight, Lock, User, KeyRound, Sparkles } from 'lucide-react';
import { NeuralPointCloudScene } from '../components/spatial/NeuralPointCloudScene';
import { ECGTelemetryWave } from '../components/spatial/ECGTelemetryWave';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('dr.clinical');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('Lead Radiologist');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-matrix-black flex items-center justify-center select-none">
      {/* 3D Neural Point Cloud Canvas Background */}
      <NeuralPointCloudScene />

      {/* Holographic Access Console Container */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-2xl spatial-glass border border-coherent-blue/30 shadow-glow-cyan">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-coherent-blue to-telemetry-cyan p-0.5 shadow-glow-cyan mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-matrix-black rounded-[14px] flex items-center justify-center">
              <Activity className="w-7 h-7 text-telemetry-cyan animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-telemetry-cyan bg-clip-text text-transparent">
            MEDISCAN <span className="text-telemetry-cyan font-mono">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Spatial Medical Screening & Explainability Console
          </p>
        </div>

        {/* Live ECG Waveform */}
        <div className="mb-6 flex justify-center">
          <ECGTelemetryWave bpm={72} />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Clinician ID / Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Security Token / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Clinical Role Clearance
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors font-mono cursor-pointer"
            >
              <option value="Lead Radiologist">Lead Radiologist (Full Diagnostic Clearance)</option>
              <option value="Clinical Reviewer">Clinical Reviewer (Verification Queue)</option>
              <option value="Research Fellow">Research Fellow (Model Lab & Datasets)</option>
              <option value="System Admin">System Administrator (Full Governance)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full mt-6 py-2.5 px-4 bg-gradient-to-r from-coherent-blue to-telemetry-cyan hover:from-telemetry-cyan hover:to-coherent-blue text-matrix-black font-semibold rounded-lg shadow-glow-cyan flex items-center justify-center gap-2 transition-all group font-mono text-sm"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-matrix-black" />
                INITIALIZING 3D WORKSTATION...
              </span>
            ) : (
              <>
                <span>ENTER DIAGNOSTIC SUITE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-clinical-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            256-bit Local Enclave
          </span>
          <span>Offline Ready v2.5</span>
        </div>
      </div>
    </div>
  );
};
