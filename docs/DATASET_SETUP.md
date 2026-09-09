# Medical Dataset Setup & Directory Structure

MediScan AI supports five primary diagnostic modalities. Use this guide to set up raw public research datasets for transfer learning and benchmarking.

---

## 1. Directory Structure

```
data/
├── raw/
│   ├── chest_xray/     # Place NIH ChestX-ray14 / CheXpert PNGs here
│   ├── retinal/        # Place EyePACS / Messidor-2 JPGs here
│   ├── skin_lesion/    # Place ISIC 2019 dermoscopy images here
│   ├── bone_xray/      # Place Stanford MURA images here
│   └── brain_mri/      # Place BraTS 2021 axial MRI slices here
├── processed/          # CLAHE-enhanced, normalized 224x224 tensors
└── sample/             # Synthetic demo radiographs for zero-configuration testing
```

---

## 2. Public Research Benchmark Sources
1. **NIH ChestX-ray14**: Download from [NIH Clinical Center](https://nihcc.app.box.com/v/ChestXray-NIHCC).
2. **EyePACS Diabetic Retinopathy**: Kaggle Diabetic Retinopathy Detection competition dataset.
3. **ISIC 2019**: Available at [ISIC Archive](https://www.isic-archive.com/).
4. **Stanford MURA**: Available via Stanford ML Group MURA challenge.
5. **BraTS 2021**: Available via RSNA-ASNR-MICCAI BraTS Challenge.

---

## 3. Preprocessing Script Execution
Run the modular preprocessing script to resize, normalize, and extract CLAHE features:
```bash
backend\.venv\Scripts\python.exe scripts/prepare_dataset.py --modality chest_xray --input_dir data/raw/chest_xray --output_dir data/processed/chest_xray
```
