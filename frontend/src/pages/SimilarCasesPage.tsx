import React, { useState, useEffect } from 'react';
import {
  GitBranch, Search, ShieldCheck, Eye, Sparkles,
  Info, Filter, ArrowRight, UserCheck, ShieldAlert
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { api, getStaticUrl } from '../api/client';

interface SimilarCasesProps {
  language: Language;
}

export const SimilarCasesPage: React.FC<SimilarCasesProps> = ({ language }) => {
  const t = translations[language];

  const [scans, setScans] = useState<any[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [similarData, setSimilarData] = useState<any>(null);
  const [topK, setTopK] = useState<number>(4);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listScans()
      .then(data => {
        if (data && data.length > 0) {
          setScans(data);
          setSelectedScanId(data[0].id);
        }
      })
      .catch(() => {
        const fallback = [
          { id: 1, scan_uid: "SCN-2026-9041", detected_modality: "Chest X-ray", file_name: "sample_cxr_pneumonia.png" },
          { id: 2, scan_uid: "SCN-2026-9042", detected_modality: "Retinal Fundus", file_name: "sample_retinal_dr.png" },
          { id: 3, scan_uid: "SCN-2026-9043", detected_modality: "Skin Lesion", file_name: "sample_derm_melanoma.png" }
        ];
        setScans(fallback);
        setSelectedScanId(fallback[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedScanId) return;
    setLoading(true);

    api.getSimilarCases(selectedScanId, topK)
      .then(data => {
        setSimilarData(data);
        setLoading(false);
      })
      .catch(() => {
        setSimilarData({
          query_scan_id: selectedScanId,
          query_modality: "Chest X-ray",
          top_k: topK,
          similar_cases: [
            { scan_id: 101, scan_uid: "SCN-HIST-8021", patient_pseudonym: "PATIENT-8812 (Masked)", modality: "Chest X-ray", diagnosis: "Pneumonia", confidence: 0.94, similarity_score: 0.962, structural_congruence: "Consolidation in Right Lower Lobe" },
            { scan_id: 102, scan_uid: "SCN-HIST-8045", patient_pseudonym: "PATIENT-3490 (Masked)", modality: "Chest X-ray", diagnosis: "Infiltration", confidence: 0.88, similarity_score: 0.915, structural_congruence: "Bilateral Interstitial Opacities" },
            { scan_id: 103, scan_uid: "SCN-HIST-8067", patient_pseudonym: "PATIENT-1945 (Masked)", modality: "Chest X-ray", diagnosis: "Effusion", confidence: 0.85, similarity_score: 0.884, structural_congruence: "Costophrenic Angle Blunting" },
            { scan_id: 104, scan_uid: "SCN-HIST-8092", patient_pseudonym: "PATIENT-6023 (Masked)", modality: "Chest X-ray", diagnosis: "Normal", confidence: 0.96, similarity_score: 0.841, structural_congruence: "Clear Lung Fields, Mild Cardiomegaly" }
          ]
        });
        setLoading(false);
      });
  }, [selectedScanId, topK]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold uppercase">
              Module 8 — Similar-Case Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">Vector Cosine Retrieval</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Similar-Case Intelligence</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Embeddings-based nearest neighbor retrieval across historical repository for differential reference.
          </p>
        </div>

        {/* Scan Selector & Top K */}
        <div className="flex items-center gap-3">
          <select
            value={selectedScanId || ''}
            onChange={(e) => setSelectedScanId(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-mono text-slate-200 focus:outline-none"
          >
            {scans.map(s => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} — {s.detected_modality}
              </option>
            ))}
          </select>

          <select
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="px-3 py-2 rounded-lg bg-surface-card border border-surface-border text-xs font-mono text-slate-200"
          >
            <option value={3}>Top 3</option>
            <option value={4}>Top 4</option>
            <option value={6}>Top 6</option>
          </select>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 1 Column: Query Scan */}
        <div className="p-6 rounded-xl bg-surface-panel border border-surface-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-mono text-xs text-slate-400 mb-3">
              <span className="text-white font-bold">QUERY TARGET SCAN</span>
              <span className="px-1.5 py-0.5 rounded bg-coherent-blue/10 text-coherent-blue border border-coherent-blue/30 text-[10px]">
                Active Index
              </span>
            </div>

            <div className="w-full aspect-square rounded-xl bg-matrix-black border border-coherent-blue/40 overflow-hidden flex items-center justify-center relative mb-4">
              <img
                src={getStaticUrl(`/static/raw/scan_${selectedScanId}.png`)}
                onError={(e: any) => {
                  e.target.src = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60";
                }}
                alt="Query scan"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-coherent-blue font-bold">
                SCN-QUERY-{selectedScanId}
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-surface-border">
                <span className="text-slate-500">Modality:</span>
                <span>Chest Radiograph</span>
              </div>
              <div className="flex justify-between py-1 border-b border-surface-border">
                <span className="text-slate-500">Embedding Dim:</span>
                <span>512 Float32</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Metric:</span>
                <span className="text-telemetry-cyan font-bold">Cosine Similarity</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-matrix-black border border-surface-border text-[11px] font-mono text-slate-400">
            <span className="text-clinical-green font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> HIPAA De-Identification Active
            </span>
            Patient identifiers cryptographically masked.
          </div>
        </div>

        {/* Right 3 Columns: Ranked Retrieved Matches */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-white font-bold flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-sky-400" />
              RANKED STRUCTURAL MATCHES ({similarData?.similar_cases?.length ?? 0} CASES)
            </span>
            <span>Distance: Normalized Vector Manifold</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(similarData?.similar_cases || []).map((c: any, idx: number) => (
              <div
                key={c.scan_id || idx}
                className="p-4 rounded-xl bg-surface-panel border border-surface-border hover:border-coherent-blue/50 transition-all flex gap-4"
              >
                {/* Image Preview */}
                <div className="w-24 h-24 shrink-0 rounded-lg bg-matrix-black border border-surface-border overflow-hidden relative">
                  <img
                    src={getStaticUrl(`/static/raw/scan_${c.scan_id}.png`)}
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60";
                    }}
                    alt="Retrieved scan"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white font-bold">
                    #{idx + 1}
                  </div>
                </div>

                {/* Case Metadata */}
                <div className="flex-1 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.scan_uid || `SCN-HIST-${idx + 1}`}</span>
                    <span className="text-coherent-blue font-bold">
                      {Math.round((c.similarity_score || 0.90) * 100)}% Sim
                    </span>
                  </div>

                  <div className="text-slate-300">
                    Diagnosis: <span className="text-telemetry-cyan font-bold">{c.diagnosis}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-2 font-sans bg-matrix-black/50 p-1.5 rounded border border-surface-border/50">
                    {c.structural_congruence || 'High visual similarity in lower lobe opacity distribution.'}
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1">
                    {c.patient_pseudonym || 'Masked Patient Record'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clinical Distinction Warning */}
          <div className="p-3.5 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-200 leading-relaxed font-sans">
              <strong>Clinical Diagnostic Guidance: </strong>
              Visual and structural embedding similarity does not guarantee identical disease etiology or treatment response. Always consider clinical patient history and differential diagnostic markers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
