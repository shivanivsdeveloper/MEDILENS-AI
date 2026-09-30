import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, GitCommit, TrendingUp, Calendar, ArrowRight,
  ShieldCheck, AlertTriangle, Layers, RefreshCw, UserCheck, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, ComposedChart } from 'recharts';
import { api, getStaticUrl } from '../api/client';
import { PatientItem, PatientDigitalTwinData, ProgressionSimulationResult } from '../types';
import { Language } from '../i18n/translations';

interface DigitalTwinPageProps {
  language: Language;
}

export const DigitalTwinPage: React.FC<DigitalTwinPageProps> = () => {
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [twinData, setTwinData] = useState<PatientDigitalTwinData | null>(null);
  const [progressionData, setProgressionData] = useState<ProgressionSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [forecastHorizon, setForecastHorizon] = useState<number>(12);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const list = await api.listPatients();
        setPatients(list);
        if (list.length > 0) {
          setSelectedPatientId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  const loadTwin = async (pId: number) => {
    setSelectedPatientId(pId);
    setLoading(true);
    try {
      const [twinRes, progRes] = await Promise.all([
        api.getPatientDigitalTwin(pId),
        api.getProgressionSimulation(pId, forecastHorizon)
      ]);
      setTwinData(twinRes);
      setProgressionData(progRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      loadTwin(selectedPatientId);
    }
  }, [selectedPatientId, forecastHorizon]);

  // Combine observed and projected points for chart visualization
  const chartData = [
    ...(progressionData?.observed_points.map((p) => ({
      month: `Month ${p.month_offset} (Observed)`,
      observed_area: p.lesion_area_pct,
      projected_area: p.lesion_area_pct,
      lower_ci: p.lesion_area_pct,
      upper_ci: p.lesion_area_pct
    })) || []),
    ...(progressionData?.projected_trajectory.map((p) => ({
      month: `Month ${p.month_offset} (Projected)`,
      projected_area: p.projected_area_pct,
      lower_ci: p.lower_bound_95ci,
      upper_ci: p.upper_bound_95ci
    })) || [])
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/30 uppercase font-bold">
              Longitudinal AI Representation
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Sparkles className="w-3 h-3 text-telemetry-cyan" />
              Structural SSIM Differencing & Trend Simulation
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-telemetry-cyan" />
            AI Medical Digital Twin & Progression Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Chronological patient timeline organizing historical imaging, structural change heatmaps, and bounded research progression trajectory projections.
          </p>
        </div>

        {/* Patient Selection */}
        <div className="flex items-center gap-2">
          <select
            value={selectedPatientId || ''}
            onChange={(e) => setSelectedPatientId(Number(e.target.value))}
            className="bg-clinical-dark border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-telemetry-cyan font-mono"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.reference_id} ({p.pseudonym || 'Patient'}) - {p.age || 'N/A'}y
              </option>
            ))}
          </select>

          <button
            onClick={() => selectedPatientId && loadTwin(selectedPatientId)}
            className="p-2 bg-surface-card hover:bg-surface-border text-slate-200 rounded-lg border border-surface-border"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-clinical-dark border border-surface-border rounded-xl p-16 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-10 h-10 animate-spin text-telemetry-cyan" />
          <div className="text-xs font-mono text-slate-400">Constructing Patient Digital Twin Timeline...</div>
        </div>
      ) : twinData ? (
        <div className="space-y-6">
          {/* Patient Overview Summary Card */}
          <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 grid grid-cols-2 md:grid-cols-5 gap-4 shadow-xl">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">SUBJECT ID</span>
              <span className="text-sm font-bold font-mono text-slate-200">{twinData.patient.reference_id}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">PSEUDONYM</span>
              <span className="text-sm font-bold text-slate-200">{twinData.patient.pseudonym || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">AGE / SEX</span>
              <span className="text-sm font-bold text-slate-200">
                {twinData.patient.age || 'N/A'}y • {twinData.patient.sex || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">LONGITUDINAL VISITS</span>
              <span className="text-sm font-bold text-telemetry-cyan font-mono">{twinData.total_visits} Scans Registered</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">TRAJECTORY STATUS</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {progressionData?.trajectory_trend || 'Morphologically Stable'}
              </span>
            </div>
          </div>

          {/* Chronological Timeline Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-telemetry-cyan" />
              Chronological Scan Sequence & AI Findings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {twinData.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-clinical-dark border border-surface-border rounded-xl p-4 space-y-3 relative hover:border-telemetry-cyan/50 transition-all shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-matrix-black border border-surface-border text-telemetry-cyan">
                      VISIT #{item.visit_index}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                  </div>

                  <div className="bg-matrix-black rounded-lg aspect-square flex items-center justify-center border border-surface-border relative overflow-hidden">
                    {item.heatmap_filename ? (
                      <img
                        src={getStaticUrl(`/static/outputs/${item.heatmap_filename}`)}
                        alt="Scan Heatmap"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-slate-700" />
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono bg-matrix-black/80 border border-surface-border text-slate-300">
                      {item.modality}
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">DIAGNOSIS:</span>
                      <span className="font-bold text-slate-200">{item.diagnosis}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">CONFIDENCE:</span>
                      <span className="font-bold text-telemetry-cyan">{(item.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[10px]">RISK:</span>
                      <span className={`font-bold ${item.risk === 'High' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {item.risk}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consecutive Difference Heatmaps & SSIM Stability */}
          {twinData.consecutive_comparisons.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-telemetry-cyan" />
                Inter-Visit Visual Delta Heatmaps (Structural SSIM Alignment)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {twinData.consecutive_comparisons.map((comp, i) => (
                  <div key={i} className="bg-clinical-dark border border-surface-border rounded-xl p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-surface-border pb-3">
                      <span className="font-mono text-xs font-bold text-slate-200">{comp.interval_label}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-matrix-black text-telemetry-cyan border border-surface-border">
                        SSIM: {comp.ssim_similarity}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-matrix-black rounded-lg aspect-video flex items-center justify-center border border-surface-border overflow-hidden relative">
                        {comp.difference_map_filename ? (
                          <img
                            src={getStaticUrl(`/static/outputs/${comp.difference_map_filename}`)}
                            alt="Visual Delta Heatmap"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-[10px] font-mono text-slate-500">Difference Map Rendered</div>
                        )}
                        <span className="absolute bottom-2 left-2 text-[9px] font-mono bg-matrix-black/80 px-1.5 py-0.5 rounded text-slate-300">
                          Focal Delta Map
                        </span>
                      </div>

                      <div className="space-y-2 text-xs font-mono flex flex-col justify-center">
                        <div className="bg-matrix-black p-2 rounded border border-surface-border">
                          <span className="text-[10px] text-slate-500 block">MORPHOLOGICAL STABILITY</span>
                          <span className="font-bold text-emerald-400">{comp.structural_stability_percent}%</span>
                        </div>
                        <div className="bg-matrix-black p-2 rounded border border-surface-border">
                          <span className="text-[10px] text-slate-500 block">ANATOMICAL CHANGE</span>
                          <span className="font-bold text-amber-400">{comp.anatomical_change_percent}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 italic block">{comp.delta_magnitude}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disease Progression Research Trajectory Simulator */}
          <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 space-y-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-surface-border pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase text-telemetry-cyan font-bold tracking-wider">
                  Research In Silico Simulator
                </div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-telemetry-cyan" />
                  Longitudinal Disease Trajectory & 95% Confidence Bounds
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Forecast Horizon:</span>
                {[6, 12, 18, 24].map((m) => (
                  <button
                    key={m}
                    onClick={() => setForecastHorizon(m)}
                    className={`px-2.5 py-1 rounded text-xs ${
                      forecastHorizon === m
                        ? 'bg-coherent-blue text-white font-bold'
                        : 'bg-matrix-black text-slate-400 hover:text-slate-200 border border-surface-border'
                    }`}
                  >
                    +{m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Trajectory Area Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="month" stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis stroke="#64748B" unit="%" tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B132B',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="upper_ci"
                    stroke="none"
                    fill="#38BDF8"
                    fillOpacity={0.15}
                    name="95% Confidence Interval"
                  />
                  <Line
                    type="monotone"
                    dataKey="observed_area"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10B981' }}
                    name="Observed Lesion Area %"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected_area"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4, fill: '#38BDF8' }}
                    name="Projected Trajectory %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[10px] font-mono text-slate-500 border-t border-surface-border/80 pt-3 flex items-center justify-between">
              <span>Fitted Slope: {progressionData?.fitted_slope_pct_per_month || 0}% / month</span>
              <span>Research Simulator Only. Not an autonomous clinical prognosis.</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-clinical-dark border border-surface-border rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
          Select a patient to generate their longitudinal digital twin.
        </div>
      )}
    </div>
  );
};
