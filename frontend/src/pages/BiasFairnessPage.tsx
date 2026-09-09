import React from 'react';
import { Scale, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

export const BiasFairnessPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];

  const subgroups = [
    { group: 'Age Bracket: 18 - 39y', count: 18420, sensitivity: 93.4, specificity: 94.8, f1: 0.925, parity: 'Optimal' },
    { group: 'Age Bracket: 40 - 64y', count: 42150, sensitivity: 92.8, specificity: 94.1, f1: 0.921, parity: 'Optimal' },
    { group: 'Age Bracket: 65y+', count: 31200, sensitivity: 91.5, specificity: 93.2, f1: 0.912, parity: 'Within CI Margin' },
    { group: 'Sex: Male Cohort', count: 46210, sensitivity: 92.6, specificity: 94.3, f1: 0.922, parity: 'Optimal' },
    { group: 'Sex: Female Cohort', count: 45560, sensitivity: 92.4, specificity: 94.0, f1: 0.920, parity: 'Optimal' },
    { group: 'Scanner: GE Healthcare Digital', count: 38200, sensitivity: 93.1, specificity: 94.5, f1: 0.924, parity: 'Optimal' },
    { group: 'Scanner: Siemens Healthineers', count: 34100, sensitivity: 92.9, specificity: 94.2, f1: 0.923, parity: 'Optimal' },
    { group: 'Scanner: Philips Medical Systems', count: 19470, sensitivity: 91.8, specificity: 93.6, f1: 0.915, parity: 'Within CI Margin' }
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Scale className="w-5 h-5 text-telemetry-cyan" />
          <span>Algorithmic Bias & Subgroup Fairness Audit</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Empirical subgroup parity assessment across demographic metadata and sensor acquisition hardware.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-alert-amber/10 border border-alert-amber/30 text-alert-amber text-xs font-mono flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <div>
          <span className="font-bold">RESEARCH & ETHICAL MANDATE: </span>
          Subgroup evaluations are performed strictly on de-identified benchmark cohorts. MediScan AI does NOT infer sensitive demographic characteristics from pixel data.
        </div>
      </div>

      <div className="p-6 rounded-2xl spatial-glass border border-surface-border overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-surface-border text-slate-400 uppercase text-[10px]">
              <th className="pb-3 font-semibold">Subgroup Strata</th>
              <th className="pb-3 font-semibold">Sample N</th>
              <th className="pb-3 font-semibold">Sensitivity</th>
              <th className="pb-3 font-semibold">Specificity</th>
              <th className="pb-3 font-semibold">F1 Score</th>
              <th className="pb-3 font-semibold text-right">Statistical Parity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50 text-slate-200">
            {subgroups.map((s, idx) => (
              <tr key={idx} className="hover:bg-surface-card/40 transition-colors">
                <td className="py-3 font-semibold text-slate-100">{s.group}</td>
                <td className="py-3 text-slate-400">{s.count.toLocaleString()}</td>
                <td className="py-3 text-coherent-blue font-bold">{s.sensitivity}%</td>
                <td className="py-3 text-clinical-green font-bold">{s.specificity}%</td>
                <td className="py-3 text-telemetry-cyan">{s.f1}</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-clinical-green/15 text-clinical-green border border-clinical-green/30 text-[10px] font-bold">
                    {s.parity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
