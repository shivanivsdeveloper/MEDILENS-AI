# Model Training & Registry Pipeline

MediScan AI decouples model training from real-time API serving. Models are trained using standard PyTorch scripts and registered into `models/registry/`.

---

## 1. Training Workflow
1. **Dataset Loading**: Using `torchvision.datasets.ImageFolder` with standard ImageNet normalization.
2. **Backbone Selection**: ResNet-50, EfficientNet-B4, DenseNet-121.
3. **Loss Function**: Weighted Cross-Entropy or Focal Loss for imbalanced clinical multi-class tasks.
4. **Optimization**: AdamW optimizer with cosine annealing learning rate scheduler (`lr=1e-4`, `weight_decay=1e-4`).

---

## 2. Checkpoint Export & Registration
Trained checkpoints (`.pth` or `.pt`) are stored in `models/checkpoints/` and registered with the Model Registry:
```json
{
  "model_id": "mod_chest_xray_v2",
  "name": "Chest Radiograph Screening Suite",
  "version": "2.4.1",
  "architecture": "ResNet-50",
  "modality": "Chest X-ray",
  "accuracy": 0.932,
  "f1_score": 0.921,
  "roc_auc": 0.964
}
```
All metrics must be evaluated on unseen test partitions and must never be fabricated.
