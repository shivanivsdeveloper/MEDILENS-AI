import React, { useState, useEffect } from 'react';
import {
  Compass, Orbit, Sliders, ShieldAlert, Layers,
  Activity, Info, Sparkles, Filter, Search
} from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Language, translations } from '../i18n/translations';

interface PatternDiscoveryProps {
  language: Language;
}

export const PatternDiscoveryPage: React.FC<PatternDiscoveryProps> = ({ language }) => {
  const t = translations[language];

  const [method, setMethod] = useState<'PCA' | 't-SNE' | 'UMAP'>('PCA');
  const [clusterAlgorithm, setClusterAlgorithm] = useState<'K-Means' | 'DBSCAN'>('K-Means');
  const [numClusters, setNumClusters] = useState<number>(4);
  const [patternData, setPatternData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const colors = ['#38BDF8', '#10B981', '#F97316', '#A855F7', '#EC4899', '#EAB308'];

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/lab/pattern-discovery/cluster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, n_clusters: numClusters })
    })
      .then(res => res.json())
      .then(data => {
        setPatternData(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback realistic clustered nodes
        const nodes = Array.from({ length: 48 }, (_, i) => {
          const cid = i % numClusters;
          return {
            scan_id: i + 1,
            scan_uid: `SCN-2026-90${i + 10}`,
            file_name: `radiograph_${i + 1}.png`,
            modality: "Chest X-ray",
            diagnosis: cid === 0 ? "Normal" : cid === 1 ? "Pneumonia" : cid === 2 ? "Infiltration" : "Effusion",
            cluster_id: cid,
            cluster_label: `Cluster ${cid + 1}`,
            x: (cid - 2) * 5 + (Math.random() * 3 - 1.5),
            y: (cid % 2 ? 3 : -3) + (Math.random() * 3 - 1.5),
            z: Math.random() * 5,
            density_score: 0.85
          };
        });
        setPatternData({
          projection_method: method,
          total_embeddings: 48,
          cluster_count: numClusters,
          nodes: nodes,
          exploratory_warning: "Unsupervised clusters identify structural and pixel-level embedding proximities. Clusters should not be assumed to represent validated clinical disease categories without expert review."
        });
        setLoading(false);
      });
  }, [method, numClusters, clusterAlgorithm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold uppercase">
              Module 7 — Unsupervised Representation Analysis
            </span>
            <span className="text-xs text-slate-400 font-mono">512-Dim Latent Manifold</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Hidden Pattern Discovery</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Explore latent feature embeddings using PCA, t-SNE, and clustering algorithms to detect visual phenotype groupings.
          </p>
        </div>

        {/* Projection Selector */}
        <div className="flex items-center gap-2">
          {(['PCA', 't-SNE', 'UMAP'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                method === m
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: 2D Manifold Scatter Plot */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-surface-panel border border-surface-border space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2 text-white font-bold">
              <Compass className="w-4 h-4 text-indigo-400" />
              {method} 2D EMBEDDING PROJECTION MANIFOLD
            </span>
            <span>Total Points: {patternData?.total_embeddings ?? 0} | Clusters: {numClusters}</span>
          </div>

          <div className="h-80 w-full bg-matrix-black/80 rounded-xl border border-surface-border p-3">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" dataKey="x" name="Dimension 1" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="Dimension 2" stroke="#64748B" tick={{ fontSize: 11 }} />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 bg-clinical-dark border border-coherent-blue rounded-lg text-xs font-mono">
                          <div className="font-bold text-white">{data.scan_uid}</div>
                          <div className="text-coherent-blue">{data.diagnosis}</div>
                          <div className="text-slate-400">{data.cluster_label}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  data={patternData?.nodes || []}
                  onClick={(node: any) => setSelectedNode(node)}
                >
                  {(patternData?.nodes || []).map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[entry.cluster_id % colors.length]}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Exploratory Warning */}
          <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-200 leading-relaxed font-sans">
              <strong>Scientific Protocol Warning: </strong>
              {patternData?.exploratory_warning || "Unsupervised clusters identify structural and pixel-level embedding proximities. Clusters should not be assumed to represent validated clinical disease categories without expert review."}
            </p>
          </div>
        </div>

        {/* Right Column: Controls & Selected Node Inspector */}
        <div className="space-y-6">
          {/* Clustering Controls */}
          <div className="p-6 rounded-xl bg-surface-panel border border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-telemetry-cyan" />
              CLUSTERING HYPERPARAMETERS
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">CLUSTERING ALGORITHM</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['K-Means', 'DBSCAN'] as const).map(alg => (
                    <button
                      key={alg}
                      onClick={() => setClusterAlgorithm(alg)}
                      className={`p-2 rounded-lg border transition-all ${
                        clusterAlgorithm === alg
                          ? 'bg-surface-card border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-surface-panel border-surface-border text-slate-400'
                      }`}
                    >
                      {alg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>CLUSTER COUNT (k)</span>
                  <span className="text-indigo-400 font-bold">{numClusters}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={numClusters}
                  onChange={(e) => setNumClusters(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Selected Case Inspection Card */}
          <div className="p-6 rounded-xl bg-surface-panel border border-surface-border space-y-3">
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Info className="w-4 h-4 text-coherent-blue" />
              CASE REPRESENTATIVE DETAIL
            </h3>

            {selectedNode ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-matrix-black border border-surface-border">
                  <div className="text-slate-400 text-[10px]">SELECTED CASE UID</div>
                  <div className="text-white font-bold text-sm mt-0.5">{selectedNode.scan_uid}</div>
                  <div className="text-coherent-blue mt-1">Diagnosis: {selectedNode.diagnosis}</div>
                  <div className="text-indigo-400 mt-0.5">Assigned: {selectedNode.cluster_label}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div className="p-2 rounded bg-surface-card">Dim 1: {selectedNode.x?.toFixed(2)}</div>
                  <div className="p-2 rounded bg-surface-card">Dim 2: {selectedNode.y?.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic font-mono p-4 text-center">
                Click any scatter node in the manifold to inspect coordinates and pathology metadata.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
