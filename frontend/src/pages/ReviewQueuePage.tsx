import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, Eye,
  RefreshCw, Download, FileText, Send, UserCheck
} from 'lucide-react';
import { api } from '../api/client';
import { ReviewQueueItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const ReviewQueuePage: React.FC<{ language: Language; userRole: string }> = ({
  language,
  userRole
}) => {
  const t = translations[language];
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  // Quick review modal
  const [selectedItem, setSelectedItem] = useState<ReviewQueueItem | null>(null);
  const [decision, setDecision] = useState<string>('Accepted');
  const [correctedLabel, setCorrectedLabel] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const data = await api.getReviewQueue(activeTab);
      setQueue(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [activeTab]);

  const handleOpenReview = (item: ReviewQueueItem) => {
    setSelectedItem(item);
    setDecision('Accepted');
    setCorrectedLabel(item.predicted_label);
    setNotes(item.reviewer_notes || '');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await api.submitReview({
        scan_id: selectedItem.scan_id,
        decision,
        reviewer_name: userRole,
        reviewer_role: userRole,
        corrected_label: decision === 'Corrected' ? correctedLabel : undefined,
        clinical_notes: notes
      });
      setSelectedItem(null);
      await loadQueue();
    } catch (err: any) {
      alert(`Review submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-telemetry-cyan" />
            <span>{t.nav_review_queue}</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Doctor/Reviewer verification suite with label override and Human-In-The-Loop (HITL) feedback tracking.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="p-2.5 rounded-xl bg-surface-card border border-surface-border text-slate-400 hover:text-slate-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border pb-3">
        {['All', 'Pending', 'Accepted', 'Corrected', 'Escalated'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
              activeTab === tab
                ? 'bg-gradient-to-r from-coherent-blue/20 to-telemetry-cyan/20 text-telemetry-cyan border border-coherent-blue/40 shadow-glow-cyan'
                : 'bg-surface-panel/60 text-slate-400 hover:text-slate-200 border border-surface-border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="p-6 rounded-2xl spatial-glass border border-surface-border">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400">
            LOADING REVIEW QUEUE...
          </div>
        ) : queue.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400">
            No screening cases in the '{activeTab}' review queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-surface-border text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">Scan UID</th>
                  <th className="pb-3 font-semibold">Patient</th>
                  <th className="pb-3 font-semibold">Modality</th>
                  <th className="pb-3 font-semibold">AI Prediction</th>
                  <th className="pb-3 font-semibold">Confidence</th>
                  <th className="pb-3 font-semibold">Risk Level</th>
                  <th className="pb-3 font-semibold">Review Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50 text-slate-200">
                {queue.map((item) => (
                  <tr key={item.scan_id} className="hover:bg-surface-card/40 transition-colors">
                    <td className="py-3 font-bold text-telemetry-cyan">{item.scan_uid}</td>
                    <td className="py-3 text-slate-300">{item.patient_reference_id}</td>
                    <td className="py-3 text-slate-300">{item.modality}</td>
                    <td className="py-3 font-semibold text-slate-100">{item.predicted_label}</td>
                    <td className="py-3 text-coherent-blue">{item.confidence_pct}%</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.risk_indicator === 'Low'
                            ? 'bg-clinical-green/15 text-clinical-green border border-clinical-green/30'
                            : item.risk_indicator === 'Moderate'
                            ? 'bg-alert-amber/15 text-alert-amber border border-alert-amber/30'
                            : 'bg-alert-crimson/15 text-alert-crimson border border-alert-crimson/30'
                        }`}
                      >
                        {item.risk_indicator}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.review_status === 'Accepted'
                            ? 'bg-clinical-green/20 text-clinical-green'
                            : item.review_status === 'Corrected'
                            ? 'bg-coherent-blue/20 text-coherent-blue'
                            : item.review_status === 'Escalated'
                            ? 'bg-alert-crimson/20 text-alert-crimson'
                            : 'bg-surface-card text-slate-400'
                        }`}
                      >
                        {item.review_status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="px-2.5 py-1 rounded bg-synaptic-indigo/20 text-synaptic-indigo border border-synaptic-indigo/40 hover:bg-synaptic-indigo/30 transition-colors"
                      >
                        Review
                      </button>
                      <Link
                        to={`/analysis?scanId=${item.scan_id}`}
                        className="px-2.5 py-1 rounded bg-surface-card border border-surface-border text-slate-300 hover:text-slate-100"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Action Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-matrix-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-clinical-dark border border-coherent-blue/40 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-glow-cyan font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-telemetry-cyan" />
                <span>Sign Case {selectedItem.scan_uid}</span>
              </h2>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Clinical Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100 focus:outline-none"
                >
                  <option value="Accepted">Accept Finding ({selectedItem.predicted_label})</option>
                  <option value="Corrected">Correct Diagnostic Finding (Override)</option>
                  <option value="Escalated">Escalate to Senior Radiologist</option>
                  <option value="Rejected">Reject (Artifacts / Substandard)</option>
                </select>
              </div>

              {decision === 'Corrected' && (
                <div>
                  <label className="block text-slate-400 mb-1">Override Label</label>
                  <input
                    type="text"
                    value={correctedLabel}
                    onChange={(e) => setCorrectedLabel(e.target.value)}
                    className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Reviewer Observations & Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-surface-panel border border-surface-border rounded-lg p-2 text-slate-100"
                  placeholder="Enter clinical impression and recommendation..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg bg-surface-card text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-bold rounded-lg"
                >
                  {submitting ? 'Signing...' : 'Sign & Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
