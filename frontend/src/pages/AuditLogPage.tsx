import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, RefreshCw, Key, FileText, User } from 'lucide-react';
import { api } from '../api/client';
import { AuditLogItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const AuditLogPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.listAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-telemetry-cyan" />
            <span>Immutable Institutional Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Cryptographic ledger tracking all model inferences, clinician reviews, data ingestions, and parameter modifications.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="p-2.5 rounded-xl bg-surface-card border border-surface-border text-slate-400 hover:text-slate-100"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 rounded-2xl spatial-glass border border-surface-border overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400">
            LOADING AUDIT LEDGER...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400">
            No audit records registered.
          </div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Timestamp (UTC)</th>
                <th className="pb-3 font-semibold">User Role</th>
                <th className="pb-3 font-semibold">Action Type</th>
                <th className="pb-3 font-semibold">Resource</th>
                <th className="pb-3 font-semibold">Payload Details</th>
                <th className="pb-3 font-semibold text-right">Host IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-card/40 transition-colors">
                  <td className="py-3 text-slate-400">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                  <td className="py-3 text-coherent-blue font-semibold">{log.role}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-surface-card border border-surface-border text-telemetry-cyan text-[11px] font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{log.resource_type}:{log.resource_id || '--'}</td>
                  <td className="py-3 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="py-3 text-right text-slate-500">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
