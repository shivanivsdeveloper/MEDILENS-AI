import React, { useState, useEffect } from 'react';
import {
  Cpu, Play, Square, RefreshCw, CheckCircle2, AlertCircle,
  Database, Sliders, Layers, Sparkles, Terminal, ArrowRight,
  ShieldCheck, Activity, BarChart3, LineChart as ChartIcon, FileText
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Language, translations } from '../i18n/translations';

interface TrainingStudioProps {
  language: Language;
}

export const ModelTrainingStudioPage: React.FC<TrainingStudioProps> = ({ language }) => {
  const t = translations[language];

  // Stepper state
  const [step, setStep] = useState<number>(1);
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form parameters
  const [name, setName] = useState('ResNet-50 Thoracic Fine-Tune v2');
  const [modality, setModality] = useState('Chest X-ray');
  const [datasetName, setDatasetName] = useState('NIH-ChestXray14-Research-Split (112,120 Scans)');
  const [architecture, setArchitecture] = useState('ResNet-50');
  const [epochs, setEpochs] = useState(12);
  const [batchSize, setBatchSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.0003);
  const [optimizer, setOptimizer] = useState('AdamW');
  const [selectedAugs, setSelectedAugs] = useState<string[]>([
    'RandomRotation (±15°)',
    'RandomHorizontalFlip (p=0.5)',
    'ColorJitter (Brightness/Contrast)'
  ]);

  const architectures = [
    { id: 'ResNet-50', name: 'ResNet-50 (Residual Network)', params: '25.6M Params', bestFor: 'Standard multi-label thoracic screening' },
    { id: 'DenseNet-121', name: 'DenseNet-121 (Dense Connectivity)', params: '8.1M Params', bestFor: 'Fine interstitial consolidation & effusion' },
    { id: 'EfficientNet-B0', name: 'EfficientNet-B0 (Compound Scaling)', params: '5.3M Params', bestFor: 'Balanced compute & accuracy performance' },
    { id: 'MobileNetV3-Large', name: 'MobileNetV3-Large (Point-of-Care)', params: '3.2M Params', bestFor: 'Low-latency tablet / edge deployment' },
  ];

  const availableAugmentations = [
    'RandomRotation (±15°)',
    'RandomHorizontalFlip (p=0.5)',
    'ColorJitter (Brightness/Contrast)',
    'RandomAffine (Shear ±10°)',
    'GaussianMotionBlur (Kernel 3x3)'
  ];

  const toggleAug = (aug: string) => {
    if (selectedAugs.includes(aug)) {
      setSelectedAugs(selectedAugs.filter(a => a !== aug));
    } else {
      setSelectedAugs([...selectedAugs, aug]);
    }
  };

  // Launch training job
  const handleStartTraining = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/lab/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          architecture,
          dataset_name: datasetName,
          epochs,
          batch_size: batchSize,
          learning_rate: learningRate,
          optimizer,
          modality,
          augmentations: selectedAugs,
          notes: `Trained via Training Studio on ${new Date().toISOString()}`
        })
      });
      const data = await res.json();
      if (data.job_id) {
        setTrainingJobId(data.job_id);
        setStep(5); // Jump to live training view
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll job status
  useEffect(() => {
    if (!trainingJobId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/lab/training/jobs/${trainingJobId}`);
        if (res.ok) {
          const data = await res.json();
          setJobStatus(data);
          if (data.status === 'Completed' || data.status === 'Cancelled' || data.status === 'Failed') {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [trainingJobId]);

  const handleCancelJob = async () => {
    if (!trainingJobId) return;
    try {
      await fetch(`/api/v1/lab/training/jobs/${trainingJobId}/cancel`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  // Prepare chart data
  const chartData = (jobStatus?.train_loss_history || []).map((tl: any, i: number) => {
    const vl = jobStatus?.val_loss_history?.[i];
    const ta = jobStatus?.train_acc_history?.[i];
    const va = jobStatus?.val_acc_history?.[i];
    return {
      epoch: tl.epoch,
      trainLoss: tl.loss,
      valLoss: vl ? vl.loss : null,
      trainAcc: ta ? (ta.accuracy * 100).toFixed(1) : null,
      valAcc: va ? (va.accuracy * 100).toFixed(1) : null,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-coherent-blue/10 text-coherent-blue border border-coherent-blue/30 font-bold uppercase">
              Module 2 — Real ML Training
            </span>
            <span className="text-xs text-slate-400 font-mono">PyTorch 2.x CUDA/AVX2</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Model Training Studio</h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Configure, train, validate, and checkpoint transfer-learning neural networks with reproducible dataset split controls.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => {
                if (s <= 4 || (s === 5 && trainingJobId)) setStep(s);
              }}
              className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                step === s
                  ? 'bg-telemetry-cyan text-matrix-black shadow-glow-cyan'
                  : step > s
                  ? 'bg-surface-card border border-coherent-blue/40 text-coherent-blue'
                  : 'bg-surface-panel border border-surface-border text-slate-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: DATASET & MODALITY SELECTION */}
      {step === 1 && (
        <div className="p-6 rounded-xl bg-surface-panel border border-surface-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-coherent-blue/10 border border-coherent-blue/30 text-coherent-blue">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Step 1: Dataset & Modality Selection</h2>
              <p className="text-xs text-slate-400">Select verified dataset split. Test partition is strictly isolated.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2">TARGET CLINICAL MODALITY</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-card border border-surface-border text-slate-200 text-xs font-mono focus:border-coherent-blue focus:outline-none"
              >
                <option value="Chest X-ray">Chest Radiography (Thoracic PA/AP)</option>
                <option value="Retinal Fundus">Retinal Fundus Photography</option>
                <option value="Skin Lesion">Dermoscopic Skin Lesion</option>
                <option value="Bone X-ray">Musculoskeletal Bone Radiography</option>
                <option value="Brain MRI">Brain Magnetic Resonance (MRI T1/T2)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-2">ANNOTATED DATASET REPOSITORY</label>
              <select
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-card border border-surface-border text-slate-200 text-xs font-mono focus:border-coherent-blue focus:outline-none"
              >
                <option value="NIH-ChestXray14-Research-Split (112,120 Scans)">NIH ChestX-ray14 (112,120 Scans, 14 Labels)</option>
                <option value="CheXpert-Benchmark-Split (224,316 Scans)">CheXpert Stanford Benchmark (224,316 Scans)</option>
                <option value="ISIC-2024-Dermoscopy-Cohort (33,126 Scans)">ISIC Melanoma Research Split (33,126 Scans)</option>
                <option value="MURA-Bone-Radiographs-Cohort (40,561 Scans)">MURA Bone Radiography Cohort (40,561 Scans)</option>
                <option value="Local-Institutional-Verified-Split (5,420 Scans)">Local Institutional Verified Cohort (5,420 Scans)</option>
              </select>
            </div>
          </div>

          {/* Split Architecture Notice */}
          <div className="p-4 rounded-lg bg-matrix-black border border-surface-border">
            <div className="text-xs font-mono text-slate-400 mb-2 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-clinical-green" />
              PATIENT-AWARE PARTITIONING STRATEGY
            </div>
            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
              <div className="p-2.5 rounded bg-surface-card border border-surface-border">
                <div className="text-coherent-blue font-bold text-sm">70%</div>
                <div className="text-[11px] text-slate-400">Training Cohort</div>
              </div>
              <div className="p-2.5 rounded bg-surface-card border border-surface-border">
                <div className="text-telemetry-cyan font-bold text-sm">15%</div>
                <div className="text-[11px] text-slate-400">Validation Split</div>
              </div>
              <div className="p-2.5 rounded bg-surface-card border border-alert-amber/30">
                <div className="text-alert-amber font-bold text-sm">15%</div>
                <div className="text-[11px] text-alert-amber">Locked Test Set</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-2 text-center">
              Patients never overlap between partitions. Zero patient-level leakage guaranteed.
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-coherent-blue text-matrix-black font-bold text-xs hover:brightness-110 transition-all shadow-glow-cyan"
            >
              Next: Architecture Selection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ARCHITECTURE SELECTION */}
      {step === 2 && (
        <div className="p-6 rounded-xl bg-surface-panel border border-surface-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-coherent-blue/10 border border-coherent-blue/30 text-coherent-blue">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Step 2: Neural Network Architecture</h2>
              <p className="text-xs text-slate-400">Select convolutional backbone with pretrained ImageNet weights.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {architectures.map((arch) => (
              <div
                key={arch.id}
                onClick={() => setArchitecture(arch.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  architecture === arch.id
                    ? 'bg-surface-card border-coherent-blue shadow-glow-cyan'
                    : 'bg-surface-panel border-surface-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white font-mono">{arch.name}</span>
                  <span className="text-[11px] font-mono text-telemetry-cyan px-2 py-0.5 rounded bg-telemetry-cyan/10">
                    {arch.params}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-sans">{arch.bestFor}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2 rounded-lg bg-surface-card text-xs text-slate-300 font-mono hover:bg-surface-border"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-coherent-blue text-matrix-black font-bold text-xs hover:brightness-110 shadow-glow-cyan"
            >
              Next: Hyperparameters <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: HYPERPARAMETERS & OPTIMIZER */}
      {step === 3 && (
        <div className="p-6 rounded-xl bg-surface-panel border border-surface-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-coherent-blue/10 border border-coherent-blue/30 text-coherent-blue">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Step 3: Hyperparameter Configuration</h2>
              <p className="text-xs text-slate-400">Configure learning rates, batch sizes, optimizers, and schedulers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">TRAINING EPOCHS</label>
              <input
                type="number"
                min={3}
                max={50}
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value) || 10)}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">BATCH SIZE</label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-white text-xs font-mono"
              >
                <option value={8}>8 Scans / Batch</option>
                <option value={16}>16 Scans / Batch (Standard)</option>
                <option value={32}>32 Scans / Batch</option>
                <option value={64}>64 Scans / Batch</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">INITIAL LEARNING RATE</label>
              <select
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-white text-xs font-mono"
              >
                <option value={0.001}>1e-3 (Aggressive)</option>
                <option value={0.0003}>3e-4 (Recommended for Fine-Tune)</option>
                <option value={0.0001}>1e-4 (Conservative)</option>
                <option value={0.00005}>5e-5 (Precision Decay)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">GRADIENT OPTIMIZER</label>
            <div className="grid grid-cols-3 gap-3">
              {['AdamW', 'SGD (Momentum=0.9)', 'RMSprop'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOptimizer(opt.split(' ')[0])}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    optimizer === opt.split(' ')[0]
                      ? 'bg-surface-card border-coherent-blue text-coherent-blue font-bold'
                      : 'bg-surface-panel border-surface-border text-slate-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 rounded-lg bg-surface-card text-xs text-slate-300 font-mono hover:bg-surface-border"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-coherent-blue text-matrix-black font-bold text-xs hover:brightness-110 shadow-glow-cyan"
            >
              Next: Augmentations & Review <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AUGMENTATIONS & FINAL REVIEW */}
      {step === 4 && (
        <div className="p-6 rounded-xl bg-surface-panel border border-surface-border space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-coherent-blue/10 border border-coherent-blue/30 text-coherent-blue">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Step 4: Augmentations & Final Launch Review</h2>
              <p className="text-xs text-slate-400">Select invariant affine & intensity transforms for training robustness.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-2">ACTIVE DATA AUGMENTATIONS</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableAugmentations.map((aug) => (
                <div
                  key={aug}
                  onClick={() => toggleAug(aug)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between text-xs font-mono ${
                    selectedAugs.includes(aug)
                      ? 'bg-surface-card border-coherent-blue text-coherent-blue'
                      : 'bg-surface-panel border-surface-border text-slate-500'
                  }`}
                >
                  <span>{aug}</span>
                  <input
                    type="checkbox"
                    checked={selectedAugs.includes(aug)}
                    onChange={() => {}}
                    className="accent-coherent-blue"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Summary Card */}
          <div className="p-4 rounded-xl bg-matrix-black border border-surface-border space-y-2">
            <div className="text-xs font-mono text-telemetry-cyan font-bold">READY TO INITIALIZE TRAINING PIPELINE</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-300 pt-2">
              <div><span className="text-slate-500">Model Name:</span> {name}</div>
              <div><span className="text-slate-500">Backbone:</span> {architecture}</div>
              <div><span className="text-slate-500">Optimizer:</span> {optimizer}</div>
              <div><span className="text-slate-500">Epochs:</span> {epochs}</div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2 rounded-lg bg-surface-card text-xs text-slate-300 font-mono hover:bg-surface-border"
            >
              ← Back
            </button>
            <button
              onClick={handleStartTraining}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-coherent-blue to-telemetry-cyan text-matrix-black font-extrabold text-sm hover:brightness-110 transition-all shadow-glow-cyan"
            >
              <Play className="w-4 h-4 fill-current" />
              {isSubmitting ? 'Initializing PyTorch...' : 'Start Model Training'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: LIVE TRAINING & CONVERGENCE MONITOR */}
      {step === 5 && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="p-6 rounded-xl bg-surface-panel border border-coherent-blue/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-telemetry-cyan font-bold">
                <Activity className="w-4 h-4 animate-spin" />
                SESSION: {trainingJobId || 'job_tr_active'}
              </div>
              <h2 className="text-xl font-bold text-white mt-1">{name} ({architecture})</h2>
              <div className="text-xs font-mono text-slate-400 mt-0.5">
                Dataset: {datasetName} | Optimizer: {optimizer} | LR: {learningRate}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-matrix-black border border-surface-border font-mono text-xs text-right">
                <div className="text-slate-400 text-[10px]">PROGRESS</div>
                <div className="text-telemetry-cyan font-bold text-base">
                  {jobStatus?.progress_percent ?? 0}%
                </div>
              </div>
              {jobStatus?.status === 'Running' && (
                <button
                  onClick={handleCancelJob}
                  className="px-4 py-2 rounded-lg bg-alert-crimson/20 border border-alert-crimson text-alert-crimson font-mono text-xs font-bold hover:bg-alert-crimson/30 transition-colors flex items-center gap-1.5"
                >
                  <Square className="w-3.5 h-3.5" /> Stop Run
                </button>
              )}
            </div>
          </div>

          {/* Loss & Accuracy Curves */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loss Curve */}
            <div className="p-6 rounded-xl bg-surface-panel border border-surface-border">
              <h3 className="text-xs font-mono text-slate-300 font-bold mb-4 flex items-center gap-2">
                <ChartIcon className="w-4 h-4 text-alert-amber" />
                TRAINING & VALIDATION LOSS (CROSS-ENTROPY)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="epoch" stroke="#64748B" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#38BDF8', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="trainLoss" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} name="Train Loss" />
                    <Line type="monotone" dataKey="valLoss" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} name="Val Loss" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Accuracy Curve */}
            <div className="p-6 rounded-xl bg-surface-panel border border-surface-border">
              <h3 className="text-xs font-mono text-slate-300 font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-clinical-green" />
                VALIDATION ACCURACY & CONVERGENCE (%)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="epoch" stroke="#64748B" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748B" tick={{ fontSize: 11 }} domain={[50, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B132B', borderColor: '#10B981', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line type="monotone" dataKey="trainAcc" stroke="#00F2FE" strokeWidth={2} dot={{ r: 3 }} name="Train Acc %" />
                    <Line type="monotone" dataKey="valAcc" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Val Acc %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Live Terminal Logs */}
          <div className="p-5 rounded-xl bg-matrix-black border border-surface-border font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border text-slate-400">
              <span className="flex items-center gap-2 text-coherent-blue font-bold">
                <Terminal className="w-4 h-4" /> LIVE EPOCH TELEMETRY STREAM
              </span>
              <span>Status: {jobStatus?.status || 'Running...'}</span>
            </div>
            <div className="mt-3 space-y-1.5 max-h-56 overflow-y-auto text-slate-300">
              {(jobStatus?.logs || []).map((log: string, idx: number) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-slate-600 mr-2">[{idx + 1}]</span>
                  <span className={log.includes('SUCCESS') ? 'text-clinical-green font-bold' : ''}>{log}</span>
                </div>
              ))}
              {(!jobStatus?.logs || jobStatus?.logs?.length === 0) && (
                <div className="text-slate-500 italic">Initializing PyTorch tensor batches and gradient buffers...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
