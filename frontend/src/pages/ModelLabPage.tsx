import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, CheckCircle2, Sliders, ToggleLeft, ToggleRight, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '../api/client';
import { ModelEntry } from '../types';
import { Language, translations } from '../i18n/translations';

export const ModelLabPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelEntry | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await api.listModels();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        const detail = await api.getModelDetail(data[0].model_id);
        setSelectedModel(detail);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectModel = async (modelId: string) => {
    try {
      const detail = await api.getModelDetail(modelId);
      setSelectedModel(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (modelId: string) => {
    try {
      await api.toggleModelStatus(modelId);
      await loadModels();
      if (selectedModel?.model_id === modelId) {
        setSelectedModel((m) => (m ? { ...m, is_active: !m.is_active } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-telemetry-cyan" />
            <span>Diagnostic Model Lab & Registry</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Certified PyTorch neural backbones, architectural telemetry, ROC-AUC curves, and confusion matrices.
          </p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {models.map((m) => (
          <div
            key={m.id}
            onClick={() => handleSelectModel(m.model_id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
              selectedModel?.model_id === m.model_id
                ? 'spatial-glass border-telemetry-cyan shadow-glow-cyan'
                : 'bg-surface-panel/60 border-surface-border hover:border-coherent-blue/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-card text-coherent-blue font-semibold">
                  {m.modality}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(m.model_id);
                  }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  {m.is_active ? (
                    <ToggleRight className="w-5 h-5 text-clinical-green" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-600" />
                  )}
                </button>
              </div>

              <div className="text-xs font-bold text-slate-100 line-clamp-1">{m.name}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">v{m.version} | {m.architecture}</div>
            </div>

            <div className="mt-4 pt-2 border-t border-surface-border flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">ROC-AUC:</span>
              <span className="font-bold text-telemetry-cyan">{m.roc_auc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Model Details & Visualizations */}
      {selectedModel && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Metrics Matrix (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl spatial-glass border border-surface-border space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <div>
                <h2 className="text-base font-bold text-slate-100">{selectedModel.name}</h2>
                <p className="text-xs font-mono text-slate-400">Dataset: {selectedModel.dataset_name}</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-clinical-green/15 text-clinical-green border border-clinical-green/30 text-xs font-mono font-bold">
                READY / INSTALLED
              </span>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-center font-mono">
                <div className="text-[10px] text-slate-400">Accuracy</div>
                <div className="text-lg font-bold text-slate-100">{Math.round(selectedModel.accuracy * 1000) / 10}%</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-center font-mono">
                <div className="text-[10px] text-slate-400">Sensitivity</div>
                <div className="text-lg font-bold text-coherent-blue">{Math.round(selectedModel.sensitivity * 1000) / 10}%</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-center font-mono">
                <div className="text-[10px] text-slate-400">Specificity</div>
                <div className="text-lg font-bold text-clinical-green">{Math.round(selectedModel.specificity * 1000) / 10}%</div>
              </div>
              <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-center font-mono">
                <div className="text-[10px] text-slate-400">F1 Score</div>
                <div className="text-lg font-bold text-telemetry-cyan">{selectedModel.f1_score}</div>
              </div>
            </div>

            {/* Labels Supported */}
            <div>
              <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">SUPPORTED DIAGNOSTIC LABELS:</div>
              <div className="flex flex-wrap gap-2">
                {selectedModel.labels.map((l, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-surface-card border border-surface-border text-xs font-mono text-slate-200">
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Confusion Matrix Table */}
            {selectedModel.confusion_matrix && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 font-semibold">BENCHMARK CONFUSION MATRIX (TEST COHORT):</div>
                <div className="p-3 rounded-lg bg-surface-panel border border-surface-border font-mono text-xs">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 rounded bg-matrix-black border border-clinical-green/30 text-clinical-green">
                      TP: {selectedModel.confusion_matrix[0][0]}
                    </div>
                    <div className="p-2 rounded bg-matrix-black border border-alert-amber/30 text-alert-amber">
                      FP: {selectedModel.confusion_matrix[0][1]}
                    </div>
                    <div className="p-2 rounded bg-matrix-black border border-alert-crimson/30 text-alert-crimson">
                      FN: {selectedModel.confusion_matrix[1][0]}
                    </div>
                    <div className="p-2 rounded bg-matrix-black border border-coherent-blue/30 text-coherent-blue">
                      TN: {selectedModel.confusion_matrix[1][1]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ROC Curve Chart (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl spatial-glass border border-surface-border flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-telemetry-cyan" />
                <span>ROC-AUC Curve Characteristic</span>
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">True Positive vs False Positive Rate</p>
            </div>

            <div className="h-64 w-full my-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedModel.roc_curve || []}>
                  <XAxis dataKey="fpr" stroke="#64748B" fontSize={10} domain={[0, 1]} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} domain={[0, 1]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A1120',
                      borderColor: '#1E293B',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <Line type="monotone" dataKey="tpr" stroke="#00F2FE" strokeWidth={2.5} dot={{ fill: '#00F2FE', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] font-mono text-slate-400 text-center">
              Area Under Curve (AUC): <span className="text-telemetry-cyan font-bold">{selectedModel.roc_auc}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
