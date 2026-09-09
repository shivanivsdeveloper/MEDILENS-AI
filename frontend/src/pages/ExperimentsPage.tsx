import React, { useState, useEffect } from 'react';
import { FlaskConical, Activity, CheckCircle2, Sliders, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { api } from '../api/client';
import { ExperimentItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const ExperimentsPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];
  const [experiments, setExperiments] = useState<ExperimentItem[]>([]);
  const [selectedExp, setSelectedExp] = useState<ExperimentItem | null>(null);

  useEffect(() => {
    api.listExperiments().then((data) => {
      setExperiments(data);
      if (data.length > 0) setSelectedExp(data[0]);
    }).catch(console.error);
  }, []);

  const chartData = selectedExp
    ? selectedExp.train_loss_history.map((tLoss, idx) => ({
        epoch: `E${idx + 1}`,
        trainLoss: tLoss,
        valLoss: selectedExp.val_loss_history[idx],
        trainAcc: selectedExp.train_acc_history[idx],
        valAcc: selectedExp.val_acc_history[idx]
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-telemetry-cyan" />
          <span>Experiment Tracking & Convergence</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Historical training runs, hyperparameter ablation logs, loss decay telemetry, and validation checkpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Experiments List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              onClick={() => setSelectedExp(exp)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedExp?.id === exp.id
                  ? 'spatial-glass border-telemetry-cyan shadow-glow-cyan'
                  : 'bg-surface-panel/60 border-surface-border hover:border-coherent-blue/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-100">{exp.experiment_id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-clinical-green/15 text-clinical-green font-semibold">
                  {exp.status}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-300 font-medium line-clamp-1">{exp.name}</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                {exp.epochs} Epochs | lr: {exp.learning_rate}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Experiment Graphs & Telemetry (8 cols) */}
        {selectedExp && (
          <div className="lg:col-span-8 p-6 rounded-2xl spatial-glass border border-surface-border space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-100">{selectedExp.name}</h2>
                <span className="text-xs font-mono text-slate-400">{selectedExp.dataset_name}</span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Architecture: <span className="text-slate-200">{selectedExp.architecture}</span> | Optimizer: <span className="text-slate-200">{selectedExp.optimizer}</span>
              </p>
            </div>

            {/* Loss Convergence Chart */}
            <div>
              <div className="text-xs font-mono text-slate-400 font-semibold mb-2">TRAINING & VALIDATION LOSS CONVERGENCE:</div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="epoch" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A1120',
                        borderColor: '#1E293B',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <Line type="monotone" dataKey="trainLoss" stroke="#00F2FE" name="Train Loss" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="valLoss" stroke="#F97316" name="Val Loss" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Notes */}
            {selectedExp.notes && (
              <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-xs font-mono text-slate-300">
                <span className="font-bold text-telemetry-cyan">EXPERIMENT NOTES: </span>
                {selectedExp.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
