import React, { useState } from 'react';
import { Database, Folder, Image, Layers, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

export const DatasetExplorerPage: React.FC<{ language: Language }> = ({ language }) => {
  const t = translations[language];

  const datasets = [
    {
      id: 'ds_nih_cxr',
      name: 'NIH ChestX-ray14 Benchmark',
      modality: 'Chest X-ray',
      samples: 112120,
      classes: ['Normal', 'Pneumonia', 'Infiltration', 'Effusion', 'Atelectasis', 'Nodule', 'Mass'],
      split: { train: '70%', val: '15%', test: '15%' },
      dimensions: '1024 x 1024 Grayscale',
      license: 'Public Domain / Research Only'
    },
    {
      id: 'ds_eyepacs',
      name: 'EyePACS & Messidor-2 Clinical Cohort',
      modality: 'Retinal Fundus',
      samples: 88702,
      classes: ['No DR', 'Mild DR', 'Moderate DR', 'Severe DR', 'Proliferative DR', 'Glaucoma'],
      split: { train: '75%', val: '10%', test: '15%' },
      dimensions: '2240 x 1488 Color RGB',
      license: 'Research Access Protocol'
    },
    {
      id: 'ds_isic',
      name: 'ISIC 2019 International Skin Imaging',
      modality: 'Skin Lesion',
      samples: 25331,
      classes: ['Melanocytic Nevus', 'Melanoma', 'Basal Cell Carcinoma', 'Actinic Keratosis'],
      split: { train: '80%', val: '10%', test: '10%' },
      dimensions: '1022 x 767 Dermoscopy',
      license: 'CC-BY-NC 4.0'
    },
    {
      id: 'ds_mura',
      name: 'Stanford MURA Musculoskeletal Radiographs',
      modality: 'Bone X-ray',
      samples: 40561,
      classes: ['Normal Bone', 'Fracture Abnormality', 'Osteopenia'],
      split: { train: '80%', val: '10%', test: '10%' },
      dimensions: '512 x 512 Multi-view',
      license: 'Stanford Research Agreement'
    },
    {
      id: 'ds_brats',
      name: 'BraTS 2021 Brain Tumor Segmentation',
      modality: 'Brain MRI',
      samples: 1251,
      classes: ['Non-Enhancing Tumor', 'Edema', 'Enhancing Tumor Core', 'No Tumor'],
      split: { train: '70%', val: '15%', test: '15%' },
      dimensions: '240 x 240 x 155 Volumetric 3D',
      license: 'Open Access Challenge'
    }
  ];

  const [selectedDataset, setSelectedDataset] = useState(datasets[0]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl spatial-glass border border-coherent-blue/20">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-telemetry-cyan" />
          <span>Medical Dataset Explorer</span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Certified academic and clinical benchmark cohorts used for transfer learning, validation, and fairness audits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Datasets List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              onClick={() => setSelectedDataset(ds)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedDataset.id === ds.id
                  ? 'spatial-glass border-telemetry-cyan shadow-glow-cyan'
                  : 'bg-surface-panel/60 border-surface-border hover:border-coherent-blue/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-100">{ds.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-card text-telemetry-cyan">
                  {ds.modality}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {ds.samples.toLocaleString()} curated medical images | {ds.dimensions}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Dataset Details (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl spatial-glass border border-surface-border space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">{selectedDataset.name}</h2>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-coherent-blue/15 text-coherent-blue border border-coherent-blue/30 font-semibold">
                {selectedDataset.modality}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              License: <span className="text-slate-200">{selectedDataset.license}</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-center">
              <div className="text-[10px] text-slate-400">Total Samples</div>
              <div className="text-base font-bold text-slate-100 mt-0.5">{selectedDataset.samples.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-center">
              <div className="text-[10px] text-slate-400">Train/Val/Test</div>
              <div className="text-base font-bold text-coherent-blue mt-0.5">{selectedDataset.split.train}/{selectedDataset.split.val}/{selectedDataset.split.test}</div>
            </div>
            <div className="p-3 rounded-lg bg-surface-panel border border-surface-border text-center">
              <div className="text-[10px] text-slate-400">Native Resolution</div>
              <div className="text-xs font-bold text-telemetry-cyan mt-1 truncate">{selectedDataset.dimensions}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">CATEGORICAL CLASSES & ANNOTATIONS:</div>
            <div className="flex flex-wrap gap-2">
              {selectedDataset.classes.map((cls, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-surface-panel border border-surface-border text-xs font-mono text-slate-200">
                  {cls}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
