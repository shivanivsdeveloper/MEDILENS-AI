import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Activity, Eye, FileText, UploadCloud } from 'lucide-react';
import { api } from '../api/client';
import { PatientItem } from '../types';
import { Language, translations } from '../i18n/translations';

export const PatientDetailPage: React.FC<{ language: Language }> = ({ language }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientItem | null>(null);

  useEffect(() => {
    if (id) {
      api.getPatientDetail(Number(id)).then(setPatient).catch(console.error);
    }
  }, [id]);

  if (!patient) {
    return (
      <div className="text-center py-20 font-mono text-xs text-slate-400">
        LOADING PATIENT DOSSIER...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-5 rounded-2xl spatial-glass border border-coherent-blue/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 rounded-xl bg-surface-card border border-surface-border text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-100">{patient.reference_id}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-coherent-blue/15 text-coherent-blue border border-coherent-blue/30">
                {patient.pseudonym || 'Anonymous'}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {patient.age} years | {patient.sex} | Registered: {patient.created_at.slice(0, 10)}
            </p>
          </div>
        </div>

        <Link
          to={`/scans/upload`}
          className="px-4 py-2 bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-semibold rounded-xl text-xs font-mono flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Scan for Patient</span>
        </Link>
      </div>

      {/* Patient Clinical Notes */}
      {patient.notes && (
        <div className="p-4 rounded-xl spatial-glass border border-surface-border">
          <div className="text-xs font-mono font-bold text-slate-300 mb-1">CLINICAL OBSERVATIONS & INDICATION</div>
          <p className="text-xs font-mono text-slate-400">{patient.notes}</p>
        </div>
      )}

      {/* Radiographic Scan Timeline */}
      <div className="p-6 rounded-2xl spatial-glass border border-surface-border space-y-4">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-telemetry-cyan" />
          <span>Longitudinal Scan Timeline ({patient.scans?.length || 0})</span>
        </h2>

        {patient.scans && patient.scans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {patient.scans.map((scan) => (
              <div key={scan.id} className="p-4 rounded-xl bg-surface-panel/80 border border-surface-border space-y-3">
                <div className="aspect-square w-full rounded-lg overflow-hidden bg-matrix-black">
                  <img src={scan.file_url} alt={scan.scan_uid} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between font-bold">
                    <span className="text-telemetry-cyan">{scan.scan_uid}</span>
                    <span className="text-slate-300">{scan.detected_modality}</span>
                  </div>
                  <div className="text-slate-400">Finding: <span className="text-slate-200">{scan.predicted_label || 'Pending'}</span></div>
                  <div className="text-slate-500 text-[10px]">{scan.created_at.slice(0, 16)}</div>
                </div>
                <div className="pt-2 border-t border-surface-border flex justify-end gap-2">
                  <Link
                    to={`/analysis?scanId=${scan.id}`}
                    className="px-3 py-1 bg-coherent-blue/15 text-coherent-blue border border-coherent-blue/30 rounded text-xs font-mono"
                  >
                    Examine
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 font-mono text-xs text-slate-500">
            No radiographic scans recorded for this patient profile yet.
          </div>
        )}
      </div>
    </div>
  );
};
