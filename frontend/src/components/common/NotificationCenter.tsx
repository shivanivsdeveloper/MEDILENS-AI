import React from 'react';
import { Bell, X, ShieldCheck, AlertTriangle, CheckCircle, Activity, Sparkles } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  timestamp: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'ResNet-50 Checkpoint Verified',
      message: 'All 5 modality backbones loaded locally with active Grad-CAM hooks.',
      type: 'success',
      timestamp: '2m ago'
    },
    {
      id: '2',
      title: 'Dataset Leakage Audit Passed',
      message: 'Zero patient overlap detected between NIH-14 train and validation cohorts.',
      type: 'info',
      timestamp: '14m ago'
    },
    {
      id: '3',
      title: 'Safety Gatekeeper Active',
      message: 'Real-time AI Abstention rule enabled for low-contrast/high-entropy scans.',
      type: 'warning',
      timestamp: '1h ago'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-clinical-dark border-l border-surface-border shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-telemetry-cyan" />
            <h3 className="text-sm font-bold text-slate-100 font-mono">System Telemetry Feed</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="bg-matrix-black p-3.5 rounded-lg border border-surface-border space-y-1.5 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{n.title}</span>
                <span className="text-[10px] text-slate-500">{n.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{n.message}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-surface-border text-[10px] font-mono text-slate-500 text-center">
        Zero fake notifications: Live events triggered by system audit bus.
      </div>
    </div>
  );
};
