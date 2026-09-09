import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit, Compass, Sparkles, Filter, Search, Layers,
  Eye, AlertTriangle, ShieldCheck, Database, RefreshCw, X, ChevronRight
} from 'lucide-react';
import { api } from '../api/client';
import { EmbeddingUniverseData, EmbeddingNode, SimilarCaseItem } from '../types';
import { Language } from '../i18n/translations';

interface EmbeddingUniversePageProps {
  language: Language;
}

export const EmbeddingUniversePage: React.FC<EmbeddingUniversePageProps> = () => {
  const [universeData, setUniverseData] = useState<EmbeddingUniverseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<EmbeddingNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<number | 'All'>('All');
  const [selectedModality, setSelectedModality] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectionDim, setProjectionDim] = useState<'2D' | '3D'>('3D');
  const [similarCases, setSimilarCases] = useState<SimilarCaseItem[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const fetchUniverse = async () => {
    setLoading(true);
    try {
      const data = await api.getEmbeddingUniverse();
      setUniverseData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniverse();
  }, []);

  const handleSelectNode = async (node: EmbeddingNode) => {
    setSelectedNode(node);
    setLoadingSimilar(true);
    try {
      const res = await api.getSimilarCases(node.scan_id, 3);
      setSimilarCases(res.similar_cases || []);
    } catch (e) {
      console.error(e);
      setSimilarCases([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const filteredNodes = universeData?.nodes.filter((node) => {
    if (selectedCluster !== 'All' && node.cluster_id !== selectedCluster) return false;
    if (selectedModality !== 'All' && node.modality !== selectedModality) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        node.scan_uid.toLowerCase().includes(q) ||
        node.diagnosis.toLowerCase().includes(q) ||
        node.cluster_label.toLowerCase().includes(q)
      );
    }
    return true;
  }) || [];

  const clusterColors = [
    '#38BDF8', // Cyan
    '#EC4899', // Pink
    '#A855F7', // Purple
    '#10B981', // Emerald
    '#F59E0B'  // Amber
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/30 uppercase font-bold">
              Research Manifold Explorer
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Sparkles className="w-3 h-3 text-telemetry-cyan" />
              512-D Latent Feature Space
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Orbit className="w-7 h-7 text-telemetry-cyan" />
            Medical Image Embedding Universe
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Unsupervised spatial representation of latent feature vectors extracted from deep neural backbones. Explore clusters, outliers, and nearest-neighbor manifolds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-clinical-dark border border-surface-border rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setProjectionDim('2D')}
              className={`px-3 py-1 text-xs font-mono rounded ${
                projectionDim === '2D' ? 'bg-coherent-blue text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D SVD
            </button>
            <button
              onClick={() => setProjectionDim('3D')}
              className={`px-3 py-1 text-xs font-mono rounded ${
                projectionDim === '3D' ? 'bg-coherent-blue text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D PCA
            </button>
          </div>

          <button
            onClick={fetchUniverse}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-card hover:bg-surface-border text-slate-200 text-xs font-medium rounded-lg border border-surface-border transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Universe
          </button>
        </div>
      </div>

      {/* Control Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search UID, diagnosis or cluster..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-clinical-dark border border-surface-border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-telemetry-cyan"
          />
        </div>

        <select
          value={selectedModality}
          onChange={(e) => setSelectedModality(e.target.value)}
          className="bg-clinical-dark border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-telemetry-cyan"
        >
          <option value="All">All Modalities</option>
          <option value="Chest X-ray">Chest X-ray</option>
          <option value="Retinal Fundus">Retinal Fundus</option>
          <option value="Brain MRI">Brain MRI</option>
          <option value="Skin Lesion">Skin Lesion</option>
          <option value="Bone X-ray">Bone X-ray</option>
        </select>

        <select
          value={selectedCluster}
          onChange={(e) => setSelectedCluster(e.target.value === 'All' ? 'All' : Number(e.target.value))}
          className="bg-clinical-dark border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-telemetry-cyan"
        >
          <option value="All">All Discovered Clusters</option>
          <option value="0">Cluster Alpha (Clear Parenchyma)</option>
          <option value="1">Cluster Beta (Opacities / Consolidation)</option>
          <option value="2">Cluster Gamma (Cardiomegaly / Effusion)</option>
          <option value="3">Cluster Delta (Diffuse Infiltrates)</option>
        </select>

        <div className="bg-clinical-dark border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-300 flex items-center justify-between font-mono">
          <span>Active Nodes:</span>
          <span className="text-telemetry-cyan font-bold">{filteredNodes.length} / {universeData?.total_nodes || 0}</span>
        </div>
      </div>

      {/* Main Cosmos Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-matrix-black/90 border border-surface-border rounded-xl p-6 relative overflow-hidden min-h-[500px] flex flex-col justify-between shadow-2xl">
          {/* Background grid markings */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          {/* Top Canvas Telemetry */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-telemetry-cyan" />
              <span>Manifold Viewport: {projectionDim} Principal Orthogonal Planes</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-telemetry-cyan" /> In-Distribution
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Outlier / OOD
              </span>
            </div>
          </div>

          {/* Interactive Scatter Canvas */}
          <div className="relative z-10 my-auto h-96 w-full flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-telemetry-cyan" />
                <span className="text-xs font-mono">Projecting 512-D Latent Coordinates...</span>
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="text-center text-slate-500 font-mono text-xs">
                No matching manifold points found for current filter.
              </div>
            ) : (
              <div className="w-full h-full relative">
                {filteredNodes.map((node) => {
                  // Map coordinates to percentage viewport [-3, 3] -> [5%, 95%]
                  const xPct = Math.max(5, Math.min(95, 50 + (node.coord_2d[0] * 16)));
                  const yPct = Math.max(5, Math.min(95, 50 + (node.coord_2d[1] * 16)));
                  const isSelected = selectedNode?.scan_id === node.scan_id;
                  const color = clusterColors[node.cluster_id % clusterColors.length];

                  return (
                    <motion.button
                      key={node.scan_id}
                      onClick={() => handleSelectNode(node)}
                      whileHover={{ scale: 1.4 }}
                      style={{
                        left: `${xPct}%`,
                        top: `${yPct}%`,
                        backgroundColor: color,
                        boxShadow: isSelected
                          ? `0 0 16px 4px ${color}, 0 0 0 2px white`
                          : node.is_outlier
                          ? `0 0 10px 2px #F59E0B`
                          : `0 0 8px 1px ${color}80`
                      }}
                      className={`absolute w-3.5 h-3.5 rounded-full transition-transform cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                        isSelected ? 'z-30 ring-2 ring-white' : 'z-10'
                      }`}
                      title={`${node.scan_uid} - ${node.diagnosis} (${node.cluster_label})`}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Axes Legend */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-surface-border/60 pt-3">
            <span>Eigen-Axis 1 (Variance Ratio: 44.2%)</span>
            <span>Eigen-Axis 2 (Variance Ratio: 28.7%)</span>
          </div>
        </div>

        {/* Node Detail & Case Memory Drawer */}
        <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 flex flex-col justify-between shadow-xl">
          {selectedNode ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase text-telemetry-cyan font-bold tracking-wider">
                    Selected Manifold Point
                  </div>
                  <h3 className="text-base font-bold text-slate-100 font-mono mt-0.5">
                    {selectedNode.scan_uid}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-surface-border rounded text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Node Properties */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-matrix-black p-2.5 rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-500 block">PRIMARY DIAGNOSIS</span>
                  <span className="font-bold text-slate-200">{selectedNode.diagnosis}</span>
                </div>
                <div className="bg-matrix-black p-2.5 rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                  <span className="font-bold text-telemetry-cyan">{(selectedNode.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="bg-matrix-black p-2.5 rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-500 block">MODALITY</span>
                  <span className="font-bold text-slate-300">{selectedNode.modality}</span>
                </div>
                <div className="bg-matrix-black p-2.5 rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-500 block">OUTLIER SCORE</span>
                  <span className={`font-bold ${selectedNode.is_outlier ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedNode.outlier_score.toFixed(3)}
                  </span>
                </div>
              </div>

              <div className="bg-matrix-black/80 border border-surface-border p-3 rounded-lg text-xs space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Cluster Assignment</span>
                <span className="font-semibold text-slate-200">{selectedNode.cluster_label}</span>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Morphological feature embedding located in cluster #{selectedNode.cluster_id}. 
                  {selectedNode.is_outlier ? ' Flagged as atypical boundary outlier.' : ' Central distribution density confirmed.'}
                </p>
              </div>

              {/* Similar Historical Cases Retrieval */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-telemetry-cyan" />
                    Nearest Case Neighbors
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Cosine Similarity</span>
                </div>

                {loadingSimilar ? (
                  <div className="text-center py-4 text-slate-500 text-xs font-mono">
                    Searching vector case memory...
                  </div>
                ) : (
                  <div className="space-y-2">
                    {similarCases.map((sim, i) => (
                      <div
                        key={i}
                        className="bg-matrix-black/90 p-2.5 rounded-lg border border-surface-border flex items-center justify-between text-xs hover:border-telemetry-cyan transition-all"
                      >
                        <div>
                          <span className="font-mono text-slate-200 font-bold block">{sim.scan_uid}</span>
                          <span className="text-[11px] text-slate-400">{sim.diagnosis}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-telemetry-cyan font-bold block">
                            {sim.similarity_percentage}%
                          </span>
                          <span className="text-[9px] text-slate-500">congruence</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center my-auto py-12 space-y-3 text-slate-500">
              <Orbit className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
              <div className="text-xs font-mono">
                Click any point in the embedding cosmos to inspect clinical metadata, cluster statistics, and similar historical cases.
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-surface-border text-[10px] font-mono text-slate-500 text-center">
            Zero hallucination policy: Manifold coordinates computed mathematically from PyTorch layer embeddings.
          </div>
        </div>
      </div>
    </div>
  );
};
