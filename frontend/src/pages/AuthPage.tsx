import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ShieldCheck, ArrowRight, Lock, User, KeyRound,
  Sparkles, Stethoscope, Building2, Heart, ShieldAlert,
  Microscope, CheckCircle2, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { NeuralPointCloudScene } from '../components/spatial/NeuralPointCloudScene';
import { ECGTelemetryWave } from '../components/spatial/ECGTelemetryWave';
import { api } from '../api/client';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<'Patient' | 'Doctor' | 'ScanCenter' | 'Admin' | 'Researcher'>('Doctor');

  // Shared Form State
  const [username, setUsername] = useState('dr.sharma');
  const [password, setPassword] = useState('DoctorPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Doctor-specific fields
  const [specialty, setSpecialty] = useState('Lead Radiologist');
  const [regNumber, setRegNumber] = useState('');
  const [hospital, setHospital] = useState('');

  // Scan Center-specific fields
  const [centerName, setCenterName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [centerAddress, setCenterAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Patient-specific fields
  const [patientAge, setPatientAge] = useState<number>(45);
  const [patientGender, setPatientGender] = useState('Other');
  const [patientLanguage, setPatientLanguage] = useState('en');
  const [patientConsent, setPatientConsent] = useState(true);

  // Status
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Preset role quick-fill helper for convenience
  const handleQuickRoleSelect = (role: 'Patient' | 'Doctor' | 'ScanCenter' | 'Admin' | 'Researcher') => {
    setSelectedRole(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (mode === 'login') {
      if (role === 'Doctor') {
        setUsername('dr.sharma');
        setPassword('DoctorPass123!');
      } else if (role === 'Patient') {
        setUsername('patient.john');
        setPassword('PatientPass123!');
      } else if (role === 'ScanCenter') {
        setUsername('metro.imaging');
        setPassword('ScanCenterPass123!');
      } else if (role === 'Admin') {
        setUsername('admin.gov');
        setPassword('AdminPass123!');
      } else if (role === 'Researcher') {
        setUsername('researcher.ai');
        setPassword('ResearchPass123!');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const res = await api.auth.login(username, password);
        const user = res.user;

        // Redirect directly to the dedicated dashboard
        if (user.role === 'Patient') {
          navigate('/patient/dashboard');
        } else if (user.role === 'Doctor') {
          navigate('/doctor/worklist');
        } else if (user.role === 'ScanCenter') {
          navigate('/scan-center/dashboard');
        } else if (user.role === 'Admin') {
          navigate('/admin/governance');
        } else if (user.role === 'Researcher') {
          navigate('/lab');
        } else {
          navigate('/');
        }
      } else {
        // Signup Flows
        if (selectedRole === 'Patient') {
          if (!patientConsent) {
            throw new Error('You must agree to the plain-language health data consent.');
          }
          await api.auth.signupPatient({
            username,
            email,
            password,
            full_name: fullName,
            age: patientAge,
            gender: patientGender,
            preferred_language: patientLanguage,
            consent_agreed: patientConsent
          });
          setSuccessMsg('Account registered successfully! You may now sign in.');
          setMode('login');
        } else if (selectedRole === 'Doctor') {
          if (!regNumber || !hospital) {
            throw new Error('Medical registration number and hospital/clinic name are required.');
          }
          await api.auth.signupDoctor({
            username,
            email,
            password,
            full_name: fullName,
            specialty,
            registration_number: regNumber,
            hospital
          });
          setSuccessMsg('Doctor registration submitted. Clinical credentials are under Admin verification.');
          setMode('login');
        } else if (selectedRole === 'ScanCenter') {
          if (!centerName || !licenseNumber) {
            throw new Error('Diagnostic center name and AERB license ID are required.');
          }
          await api.auth.signupScanCenter({
            username,
            email,
            password,
            center_name: centerName,
            license_number: licenseNumber,
            address: centerAddress,
            contact_phone: contactPhone
          });
          setSuccessMsg('Scan Center facility registered. Account will be activated upon Admin approval.');
          setMode('login');
        } else {
          throw new Error('Admin and Researcher accounts are provisioned by system administrators.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="relative w-screen min-h-screen overflow-y-auto bg-matrix-black flex items-center justify-center p-4 select-none">
      {/* 3D Neural Point Cloud Canvas Background */}
      <NeuralPointCloudScene />

      {/* Holographic Access Console Container */}
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-2xl spatial-glass border border-coherent-blue/30 shadow-glow-cyan my-8">
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
            Clinical Decision-Support & Medical Research Platform
          </p>
        </div>

        {/* Live ECG Telemetry Bar */}
        <div className="mb-6 flex justify-center">
          <ECGTelemetryWave bpm={72} />
        </div>

        {/* Sign In vs Register Toggle */}
        <div className="flex rounded-xl bg-matrix-black/80 p-1 border border-surface-border mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              mode === 'login'
                ? 'bg-coherent-blue text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In to Enclave
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-coherent-blue text-white shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Role Quick Selector */}
        <div className="mb-5 space-y-1.5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Select Your Role
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'Patient', label: 'Patient', icon: Heart },
              { id: 'Doctor', label: 'Doctor', icon: Stethoscope },
              { id: 'ScanCenter', label: 'Scan Center', icon: Building2 },
              { id: 'Researcher', label: 'Researcher', icon: Microscope },
              { id: 'Admin', label: 'Admin', icon: ShieldAlert }
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleQuickRoleSelect(r.id as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? 'border-telemetry-cyan bg-coherent-blue/20 text-telemetry-cyan font-bold shadow-glow-cyan'
                      : 'border-surface-border bg-surface-panel/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-mono truncate">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-alert-crimson/15 border border-alert-crimson/40 flex items-center gap-2 text-alert-crimson text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-clinical-green/15 border border-clinical-green/40 flex items-center gap-2 text-clinical-green text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="e.g. dr.sharma or patient.john"
                className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Sharma or Ananya Iyer"
                  className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
                  required
                />
              </div>

              {/* Role-specific Signup Fields */}
              {selectedRole === 'Doctor' && (
                <div className="space-y-3 p-3 rounded-xl bg-coherent-blue/10 border border-coherent-blue/30 font-mono text-xs">
                  <div className="text-telemetry-cyan font-bold flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4" />
                    Clinical Credential Details
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Medical Registration Number (MCI / State Council)</label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="MCI-2018-88492"
                      className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Hospital / Clinic Affiliation</label>
                    <input
                      type="text"
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      placeholder="Apollo Radiology Institute"
                      className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'ScanCenter' && (
                <div className="space-y-3 p-3 rounded-xl bg-coherent-blue/10 border border-coherent-blue/30 font-mono text-xs">
                  <div className="text-telemetry-cyan font-bold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    Diagnostic Facility License
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Facility Name</label>
                    <input
                      type="text"
                      value={centerName}
                      onChange={(e) => setCenterName(e.target.value)}
                      placeholder="Apex Diagnostic Imaging"
                      className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">AERB Diagnostic Registration ID</label>
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="AERB-DIAG-2026-009"
                      className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Facility Address & Phone</label>
                    <input
                      type="text"
                      value={centerAddress}
                      onChange={(e) => setCenterAddress(e.target.value)}
                      placeholder="45 Hospital Road, Chennai"
                      className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none mb-2"
                    />
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98400 12345"
                      className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedRole === 'Patient' && (
                <div className="space-y-3 p-3 rounded-xl bg-coherent-blue/10 border border-coherent-blue/30 font-mono text-xs">
                  <div className="text-telemetry-cyan font-bold flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    Patient Preferences & Privacy Consent
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Age</label>
                      <input
                        type="number"
                        value={patientAge}
                        onChange={(e) => setPatientAge(Number(e.target.value))}
                        className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Language</label>
                      <select
                        value={patientLanguage}
                        onChange={(e) => setPatientLanguage(e.target.value)}
                        className="w-full bg-surface-panel border border-surface-border rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                      >
                        <option value="en">English</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={patientConsent}
                      onChange={(e) => setPatientConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      I consent to secure digital archiving of my medical scans under the control of my authorized doctors.
                    </span>
                  </label>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Security Token / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-lg pl-9 pr-10 py-2 text-sm text-slate-100 focus:outline-none transition-colors font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full mt-6 py-2.5 px-4 bg-gradient-to-r from-coherent-blue to-telemetry-cyan hover:from-telemetry-cyan hover:to-coherent-blue text-matrix-black font-semibold rounded-lg shadow-glow-cyan flex items-center justify-center gap-2 transition-all group font-mono text-sm"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-matrix-black" />
                VERIFYING ENCLAVE CLEARANCE...
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'ENTER DIAGNOSTIC SUITE' : 'REGISTER ROLE PROFILE'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-clinical-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            PBKDF2-SHA256 Encrypted
          </span>
          <span>MediScan RBAC v3.0</span>
        </div>
      </div>
    </div>
  );
};
