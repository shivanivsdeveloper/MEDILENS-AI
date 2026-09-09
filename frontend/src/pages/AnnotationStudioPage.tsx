import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Square, Circle, PenTool, Layers, History, Save,
  Plus, Undo2, ZoomIn, ZoomOut, Check, Users, Sparkles, Image as ImageIcon, Tag
} from 'lucide-react';
import { api } from '../api/client';
import { ScanItem, ClinicalAnnotation, ReviewerConsensusData } from '../types';
import { Language } from '../i18n/translations';

interface AnnotationStudioPageProps {
  language: Language;
}

export const AnnotationStudioPage: React.FC<AnnotationStudioPageProps> = () => {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<ClinicalAnnotation[]>([]);
  const [consensus, setConsensus] = useState<ReviewerConsensusData | null>(null);
  const [activeTool, setActiveTool] = useState<'box' | 'point' | 'polygon'>('box');
  const [selectedLabel, setSelectedLabel] = useState<string>('Consolidation');
  const [newLabelText, setNewLabelText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [overlayOpacity, setOverlayOpacity] = useState(0.8);
  const [authorName, setAuthorName] = useState('Dr. S. Vance (Lead Radiologist)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const list = await api.listScans();
        setScans(list);
        if (list.length > 0) {
          setSelectedScanId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchScans();
  }, []);

  const loadScanAnnotations = async (scanId: number) => {
    try {
      const [annos, cons] = await Promise.all([
        api.listAnnotations(scanId),
        api.getReviewerConsensus(scanId)
      ]);
      setAnnotations(annos);
      setConsensus(cons);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedScanId) {
      loadScanAnnotations(selectedScanId);
    }
  }, [selectedScanId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || activeTool !== 'box') return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPoint({ x, y });
    setIsDrawing(true);
    setCurrentBox({ x, y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);
    const w = Math.abs(currentX - startPoint.x);
    const h = Math.abs(currentY - startPoint.y);
    setCurrentBox({ x, y, w, h });
  };

  const handleMouseUp = async () => {
    if (!isDrawing || !currentBox || !selectedScanId) {
      setIsDrawing(false);
      return;
    }
    setIsDrawing(false);

    if (currentBox.w > 15 && currentBox.h > 15) {
      const payload = {
        scan_id: selectedScanId,
        author_name: authorName,
        author_role: 'Lead Radiologist',
        annotation_type: 'bounding_box',
        label: selectedLabel,
        data_json: JSON.stringify({
          x: Math.round(currentBox.x),
          y: Math.round(currentBox.y),
          width: Math.round(currentBox.w),
          height: Math.round(currentBox.h)
        })
      };

      try {
        await api.createAnnotation(payload);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
        loadScanAnnotations(selectedScanId);
      } catch (err) {
        console.error(err);
      }
    }
    setCurrentBox(null);
  };

  const currentScan = scans.find((s) => s.id === selectedScanId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-coherent-blue/20 text-telemetry-cyan border border-coherent-blue/30 uppercase font-bold">
              Radiological Annotation Studio
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <History className="w-3.5 h-3.5 text-telemetry-cyan" />
              Version-Controlled Region of Interest Lab
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <PenTool className="w-7 h-7 text-telemetry-cyan" />
            Clinical Annotation Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Multi-rater precision ROI annotation workstation with version control history, consensus Kappa metrics, and human-in-the-loop candidate training exports.
          </p>
        </div>

        {/* Scan Selector & Reviewer Name */}
        <div className="flex items-center gap-2">
          <select
            value={selectedScanId || ''}
            onChange={(e) => setSelectedScanId(Number(e.target.value))}
            className="bg-clinical-dark border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-telemetry-cyan font-mono"
          >
            {scans.map((s) => (
              <option key={s.id} value={s.id}>
                {s.scan_uid} - {s.detected_modality}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Toolset & Labels Sidebar */}
        <div className="bg-clinical-dark border border-surface-border rounded-xl p-5 space-y-5 shadow-xl">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2">
              GEOMETRIC TOOLS
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTool('box')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  activeTool === 'box'
                    ? 'bg-coherent-blue/20 border-telemetry-cyan text-telemetry-cyan font-bold'
                    : 'bg-matrix-black border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Square className="w-4 h-4" />
                <span>Box</span>
              </button>
              <button
                onClick={() => setActiveTool('point')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  activeTool === 'point'
                    ? 'bg-coherent-blue/20 border-telemetry-cyan text-telemetry-cyan font-bold'
                    : 'bg-matrix-black border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <Circle className="w-4 h-4" />
                <span>Point</span>
              </button>
              <button
                onClick={() => setActiveTool('polygon')}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  activeTool === 'polygon'
                    ? 'bg-coherent-blue/20 border-telemetry-cyan text-telemetry-cyan font-bold'
                    : 'bg-matrix-black border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Polygon</span>
              </button>
            </div>
          </div>

          {/* Finding Labels Selection */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              CLINICAL FINDING LABEL
            </span>
            <div className="space-y-1.5">
              {['Consolidation', 'Pleural Effusion', 'Infiltrate / Opacity', 'Cardiomegaly', 'Pneumothorax', 'Microaneurysm'].map((lbl) => (
                <button
                  key={lbl}
                  onClick={() => setSelectedLabel(lbl)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                    selectedLabel === lbl
                      ? 'bg-coherent-blue text-white font-bold'
                      : 'bg-matrix-black text-slate-300 hover:bg-surface-border border border-surface-border'
                  }`}
                >
                  <span>{lbl}</span>
                  {selectedLabel === lbl && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity & View Controls */}
          <div className="space-y-3 pt-3 border-t border-surface-border">
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Overlay Opacity:</span>
                <span className="text-telemetry-cyan font-bold">{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-telemetry-cyan h-1 bg-surface-border rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-400">Zoom Canvas:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                  className="p-1 bg-matrix-black border border-surface-border rounded hover:bg-surface-border text-slate-300"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-slate-300 px-1">{zoomLevel.toFixed(2)}x</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1 bg-matrix-black border border-surface-border rounded hover:bg-surface-border text-slate-300"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Reviewer Consensus Metrics */}
          {consensus && (
            <div className="bg-matrix-black p-3.5 rounded-lg border border-surface-border space-y-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-telemetry-cyan font-bold">
                <Users className="w-4 h-4" />
                <span>Inter-Rater Consensus</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Cohen's Kappa:</span>
                <span className="font-bold text-emerald-400">{consensus.cohens_kappa}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Agreement Rate:</span>
                <span className="font-bold text-telemetry-cyan">{consensus.agreement_percentage}%</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-surface-border/60">
                {consensus.interpretation}
              </p>
            </div>
          )}
        </div>

        {/* Central Annotation Viewport Canvas */}
        <div className="lg:col-span-3 bg-matrix-black border border-surface-border rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl min-h-[550px]">
          {savedSuccess && (
            <div className="absolute top-4 right-4 z-40 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-glow-cyan animate-bounce">
              <Check className="w-4 h-4" /> Annotation v1 Recorded
            </div>
          )}

          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ transform: `scale(${zoomLevel})` }}
            className="relative select-none cursor-crosshair border border-surface-border/80 rounded-lg overflow-hidden transition-transform duration-100 max-w-[512px] max-h-[512px]"
          >
            {currentScan?.file_url ? (
              <img
                src={currentScan.file_url}
                alt="Scan Canvas"
                className="w-[512px] h-[512px] object-cover pointer-events-none"
              />
            ) : (
              <div className="w-[512px] h-[512px] bg-clinical-dark flex flex-col items-center justify-center text-slate-600 gap-2">
                <ImageIcon className="w-16 h-16" />
                <span className="text-xs font-mono">Select scan to render canvas</span>
              </div>
            )}

            {/* Saved Annotations Overlays */}
            {annotations.map((a) => {
              if (a.data.x !== undefined && a.data.y !== undefined && a.data.width && a.data.height) {
                return (
                  <div
                    key={a.id}
                    style={{
                      left: `${a.data.x}px`,
                      top: `${a.data.y}px`,
                      width: `${a.data.width}px`,
                      height: `${a.data.height}px`,
                      opacity: overlayOpacity
                    }}
                    className="absolute border-2 border-telemetry-cyan bg-telemetry-cyan/20 rounded pointer-events-none group"
                  >
                    <span className="absolute -top-5 left-0 bg-coherent-blue text-[10px] font-mono text-white px-1.5 py-0.5 rounded shadow">
                      {a.label} (v{a.current_version})
                    </span>
                  </div>
                );
              }
              return null;
            })}

            {/* Currently Drawing Box */}
            {currentBox && isDrawing && (
              <div
                style={{
                  left: `${currentBox.x}px`,
                  top: `${currentBox.y}px`,
                  width: `${currentBox.w}px`,
                  height: `${currentBox.h}px`
                }}
                className="absolute border-2 border-dashed border-amber-400 bg-amber-400/20 rounded pointer-events-none"
              >
                <span className="absolute -top-5 left-0 bg-amber-500 text-[10px] font-mono text-black font-bold px-1.5 py-0.5 rounded">
                  {selectedLabel}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs font-mono text-slate-500 flex items-center gap-4">
            <span>Active Layers: {annotations.length} Clinical ROIs</span>
            <span>•</span>
            <span>Click and drag on canvas to demarcate abnormal findings</span>
          </div>
        </div>
      </div>
    </div>
  );
};
