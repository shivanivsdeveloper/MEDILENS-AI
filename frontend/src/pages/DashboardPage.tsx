import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowUpRight, CheckCircle2, Clock, AlertTriangle,
  UploadCloud, Zap, ShieldCheck, Eye, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../api/client';
import { DashboardAnalytics } from '../types';
import { Language, translations } from '../i18n/translations';

export const DashboardPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-telemetry-cyan animate-spin" />
        <div className="text-xs font-mono text-slate-400">LOADING CLINICAL TELEMETRY...</div>
      </div>
    );
  }

  const riskPieData = [
    { name: 'Low Risk', value: data.risk_distribution['Low'] || 0, color: '#10B981' },
    { name: 'Moderate Risk', value: data.risk_distribution['Moderate'] || 0, color: '#F97316' },
    { name: 'High Risk', value: data.risk_distribution['High'] || 0, color: '#EF4444' },
    { name: 'Needs Review', value: data.risk_distribution['Needs Review'] || 0, color: '#A855F7' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Scan */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl spatial-glass border border-coherent-blue/20">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>{t.app_title}</span>
            <span className="text-telemetry-cyan font-mono text-sm px-2 py-0.5 bg-telemetry-cyan/10 rounded border border-telemetry-cyan/30">
              OPERATIONAL
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time multi-modality radiograph screening, uncertainty quantification & Grad-CAM telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-xl bg-surface-card border border-surface-border text-slate-400 hover:text-slate-100 hover:bg-surface-card/80 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/scans/upload"
            className="px-4 py-2.5 bg-gradient-to-r from-coherent-blue to-telemetry-cyan hover:from-telemetry-cyan hover:to-coherent-blue text-matrix-black font-semibold rounded-xl text-xs font-mono flex items-center gap-2 shadow-glow-cyan transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t.upload_new_scan}</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="p-5 rounded-xl bg-surface-panel/70 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">{t.total_scans}</span>
            <Activity className="w-4 h-4 text-telemetry-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{data.total_scans}</div>
          <div className="text-[11px] font-mono text-clinical-green mt-1 flex items-center gap-1">
            <span>+{data.today_scans} ingested today</span>
          </div>
        </div>

        {/* Reviewed Cases */}
        <div className="p-5 rounded-xl bg-surface-panel/70 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">{t.reviewed_cases}</span>
            <CheckCircle2 className="w-4 h-4 text-clinical-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{data.reviewed_cases}</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            {data.pending_reviews} awaiting clinician review
          </div>
        </div>

        {/* Abnormal Screenings */}
        <div className="p-5 rounded-xl bg-surface-panel/70 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">{t.abnormal_screenings}</span>
            <AlertTriangle className="w-4 h-4 text-alert-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-alert-amber">{data.abnormal_screenings}</div>
          <div className="text-[11px] font-mono text-slate-400 mt-1">
            Elevated or high pathology risk
          </div>
        </div>

        {/* Inference Latency */}
        <div className="p-5 rounded-xl bg-surface-panel/70 border border-surface-border relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">{t.avg_inference_time}</span>
            <Zap className="w-4 h-4 text-synaptic-indigo" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {data.average_inference_time_ms} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
          <div className="text-[11px] font-mono text-coherent-blue mt-1">
            {data.models_active_count} active PyTorch backbones
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Scan Volume Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl spatial-glass border border-surface-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-telemetry-cyan" />
              <span>{t.scan_volume}</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Daily Ingestion & Findings</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.scan_volume_trend}>
                <defs>
                  <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A1120',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
                <Area type="monotone" dataKey="scans" stroke="#00F2FE" strokeWidth={2} fillOpacity={1} fill="url(#scanGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Breakdown Donut Chart */}
        <div className="p-5 rounded-xl spatial-glass border border-surface-border flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-synaptic-violet" />
              <span>{t.risk_breakdown}</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Stratified by risk indicator</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A1120',
                    borderColor: '#1E293B',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-surface-border">
            {riskPieData.map((r, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="text-slate-400 truncate">{r.name}:</span>
                <span className="text-slate-200 font-bold">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="p-5 rounded-xl spatial-glass border border-surface-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">{t.recent_scans}</h2>
            <p className="text-[11px] font-mono text-slate-400">Direct link into AI Diagnostic Workstation</p>
          </div>
          <Link
            to="/scans/upload"
            className="text-xs font-mono text-telemetry-cyan hover:underline flex items-center gap-1"
          >
            <span>Scan Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-surface-border text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Scan UID</th>
                <th className="pb-3 font-semibold">Patient Ref</th>
                <th className="pb-3 font-semibold">Modality</th>
                <th className="pb-3 font-semibold">Quality</th>
                <th className="pb-3 font-semibold">AI Finding</th>
                <th className="pb-3 font-semibold">Risk Level</th>
                <th className="pb-3 font-semibold">Review Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-200">
              {data.recent_scans.map((scan) => (
                <tr key={scan.id} className="hover:bg-surface-card/40 transition-colors">
                  <td className="py-3 font-bold text-telemetry-cyan">{scan.scan_uid}</td>
                  <td className="py-3 text-slate-300">{scan.patient_reference_id || 'Unassigned'}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-surface-card border border-surface-border text-slate-300 text-[11px]">
                      {scan.detected_modality}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`font-semibold ${scan.quality_score >= 80 ? 'text-clinical-green' : scan.quality_score >= 60 ? 'text-coherent-blue' : 'text-alert-amber'}`}>
                      {scan.quality_score}/100
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-100">
                    {scan.predicted_label || 'Analysis Pending'}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        scan.risk_indicator === 'Low'
                          ? 'bg-clinical-green/15 text-clinical-green border border-clinical-green/30'
                          : scan.risk_indicator === 'Moderate'
                          ? 'bg-alert-amber/15 text-alert-amber border border-alert-amber/30'
                          : scan.risk_indicator === 'High'
                          ? 'bg-alert-crimson/15 text-alert-crimson border border-alert-crimson/30'
                          : 'bg-synaptic-violet/15 text-synaptic-violet border border-synaptic-violet/30'
                      }`}
                    >
                      {scan.risk_indicator || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-slate-400 text-[11px]">{scan.review_status}</span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      to={`/analysis?scanId=${scan.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-coherent-blue/15 hover:bg-coherent-blue/25 text-coherent-blue border border-coherent-blue/30 text-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Examine</span>
                    </Link>
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
