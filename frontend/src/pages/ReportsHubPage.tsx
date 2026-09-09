import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { ScanItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const ReportsHubPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.listScans();
      setScans(data.filter((s) => s.has_analysis));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredScans = scans.filter(
    (s) =>
      s.scan_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.patient_reference_id && s.patient_reference_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.predicted_label && s.predicted_label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-telemetry-cyan" />
            <span>Institutional Screening Reports Hub</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Automated PDF clinical screening reports generated via ReportLab with embedded radiographs, Grad-CAM overlays, and safety notices.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter reports by Scan UID, Patient Reference, or Primary Finding..."
          className="w-full bg-surface-panel/80 border border-surface-border focus:border-telemetry-cyan rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-100 focus:outline-none transition-colors"
        />
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredScans.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-xl spatial-glass border border-surface-border flex flex-col justify-between space-y-4 hover:border-coherent-blue/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-coherent-blue/15 border border-coherent-blue/30 flex items-center justify-center text-coherent-blue">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-100">{s.scan_uid}</div>
                    <div className="text-[10px] font-mono text-slate-400">{s.detected_modality}</div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    s.risk_indicator === 'Low'
                      ? 'bg-clinical-green/15 text-clinical-green border border-clinical-green/30'
                      : s.risk_indicator === 'Moderate'
                      ? 'bg-alert-amber/15 text-alert-amber border border-alert-amber/30'
                      : 'bg-alert-crimson/15 text-alert-crimson border border-alert-crimson/30'
                  }`}
                >
                  {s.risk_indicator}
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono bg-surface-panel/80 p-3 rounded-lg border border-surface-border/50">
                <div className="text-slate-400">
                  Patient Ref: <span className="text-slate-200">{s.patient_reference_id || 'Unassigned'}</span>
                </div>
                <div className="text-slate-400">
                  Screening Result: <span className="text-telemetry-cyan font-semibold">{s.predicted_label}</span>
                </div>
                <div className="text-slate-400">
                  Image Quality: <span className="text-slate-200">{s.quality_score}/100</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-surface-border flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                Date: {s.created_at.slice(0, 10)}
              </span>
              <a
                href={api.getReportUrl(s.id)}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-mono text-xs font-semibold flex items-center gap-1.5 shadow-glow-cyan hover:opacity-90 transition-opacity"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Report</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
