import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, ShieldCheck, UserCheck, UserX, Clock,
  Activity, Database, Server, RefreshCw, CheckCircle2,
  AlertTriangle, FileText, Lock, Users, Building2, Stethoscope
} from 'lucide-react';
import { api } from '../api/client';
import { AuditLogItem, SystemHealthData } from '../types';
import { Language, translations } from '../i18n/translations';

interface AdminDashboardPageProps {
  language: Language;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ language }) => {
  const t = translations[language];
  const navigate = useNavigate();

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [approvals, logs, health] = await Promise.all([
        api.auth.getPendingApprovals().catch(() => []),
        api.listAuditLogs().catch(() => []),
        api.getHealth().catch(() => null)
      ]);
      setPendingApprovals(approvals);
      setAuditLogs(logs);
      setSystemHealth(health);
    } catch (err) {
      console.error('Failed to load admin governance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDecision = async (userId: number, decision: 'Approved' | 'Rejected') => {
    try {
      await api.auth.decideApproval(userId, decision);
      setActionSuccessMsg(`User clearance updated: ${decision}`);
      await loadAdminData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Decision recording failed: ${err.message || err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Governance Header */}
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-coherent-blue/20 to-telemetry-cyan/20 border border-coherent-blue/40 flex items-center justify-center text-telemetry-cyan">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{t.role_admin}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-coherent-blue/20 text-coherent-blue border border-coherent-blue/40 font-bold">
                Master Governance clearance
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Verify medical credentials, enforce access control, inspect immutable audit trails, and oversee system safety.
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2 rounded-lg bg-surface-panel hover:bg-surface-card border border-surface-border text-slate-300 flex items-center gap-1.5 text-xs font-mono self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Governance Feed</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-clinical-green/15 border border-clinical-green/40 flex items-center gap-2 text-clinical-green text-xs font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Governance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Pending Verifications</span>
            <Clock className="w-4 h-4 text-alert-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-alert-amber">{pendingApprovals.length}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Doctors & Scan Centers awaiting review</div>
        </div>

        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>System Status</span>
            <Activity className="w-4 h-4 text-clinical-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-clinical-green">
            {systemHealth?.status === 'healthy' ? 'OPTIMAL' : 'ONLINE'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">PyTorch 2.6 & SQLite Enclave Active</div>
        </div>

        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Audit Trail Entries</span>
            <FileText className="w-4 h-4 text-coherent-blue" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{auditLogs.length}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Immutable security log events</div>
        </div>

        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>Security Model</span>
            <Lock className="w-4 h-4 text-telemetry-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-telemetry-cyan">PBKDF2-100k</div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Role-Based Access Control Enforced</div>
        </div>
      </div>

      {/* Section 1: Pending Clinical & Scan Center Approvals */}
      <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-alert-amber" />
            <span>Pending Medical Registration & Facility Approvals ({pendingApprovals.length})</span>
          </h2>
          <p className="text-xs font-mono text-slate-400">
            Unverified clinicians and facilities are quarantined and cannot access patient medical records until approved.
          </p>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface-panel/40 border border-surface-border text-center">
            <CheckCircle2 className="w-8 h-8 text-clinical-green mx-auto mb-2 opacity-80" />
            <div className="text-xs font-mono text-slate-300 font-bold">No Pending Verifications</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              All registered doctors and scan centers have been vetted and verified.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((req) => (
              <div
                key={req.user_id}
                className="p-4 rounded-xl bg-surface-panel/80 border border-surface-border flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-alert-amber/20 text-alert-amber border border-alert-amber/40">
                      {req.role} Verification Request
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{req.submitted_at}</span>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <div className="text-slate-100 font-bold text-sm">
                      {req.credentials?.full_name || req.credentials?.center_name || req.username}
                    </div>
                    <div className="text-slate-400">User ID: @{req.username} · {req.email}</div>

                    {req.role === 'Doctor' ? (
                      <div className="mt-2 p-2.5 rounded bg-matrix-black/60 border border-surface-border text-[11px] space-y-1">
                        <div className="text-telemetry-cyan font-semibold flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          Registration No: {req.credentials?.reg_no || 'MCI-PENDING'}
                        </div>
                        <div className="text-slate-300">Specialty: {req.credentials?.specialty}</div>
                        <div className="text-slate-400">Hospital: {req.credentials?.hospital}</div>
                      </div>
                    ) : (
                      <div className="mt-2 p-2.5 rounded bg-matrix-black/60 border border-surface-border text-[11px] space-y-1">
                        <div className="text-coherent-blue font-semibold flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Facility Lic: {req.credentials?.license_no || 'AERB-PENDING'}
                        </div>
                        <div className="text-slate-300">Facility: {req.credentials?.center_name}</div>
                        <div className="text-slate-400">Address: {req.credentials?.address}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDecision(req.user_id, 'Rejected')}
                    className="px-3 py-1.5 rounded-lg bg-alert-crimson/15 hover:bg-alert-crimson/25 text-alert-crimson border border-alert-crimson/30 text-xs font-mono font-semibold flex items-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleDecision(req.user_id, 'Approved')}
                    className="px-3 py-1.5 rounded-lg bg-clinical-green/20 hover:bg-clinical-green/30 text-clinical-green border border-clinical-green/40 text-xs font-mono font-semibold flex items-center gap-1 transition-colors shadow-glow-cyan"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approve Credentials</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Immutable Security Audit Log Inspector */}
      <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-telemetry-cyan" />
              <span>Immutable System Audit Trail</span>
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Complete chronological ledger of all clinical logins, scan access, sharing events, and report signatures.
            </p>
          </div>
          <button
            onClick={() => navigate('/audit')}
            className="text-xs font-mono text-coherent-blue hover:text-telemetry-cyan transition-colors"
          >
            Open Full Audit Console →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 bg-surface-panel/50">
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Actor / User</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50">
              {auditLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="hover:bg-surface-panel/30">
                  <td className="py-2 px-3 text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-2 px-3 font-bold text-slate-200">{log.user_identifier}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-coherent-blue/15 text-coherent-blue border border-coherent-blue/30">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-100">{log.action}</td>
                  <td className="py-2 px-3 text-slate-400 text-[11px]">{log.resource_type} #{log.resource_id}</td>
                  <td className="py-2 px-3 text-slate-500 text-[10px] truncate max-w-xs">
                    {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
