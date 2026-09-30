from typing import Dict, Any, List, Optional
import gc

class ModelRegistry:
    """
    Central Registry for all diagnostic models, managing lazy instantiation,
    routing, benchmarking, and single-active-model memory management.
    """

    def __init__(self):
        self._modules: Dict[str, Any] = {}
        self._modality_map: Dict[str, str] = {
            "Chest X-ray": "mod_chest_xray_v2",
            "Retinal Fundus": "mod_retinal_v2",
            "Skin Lesion": "mod_skin_v2",
            "Bone X-ray": "mod_bone_v2",
            "Brain MRI": "mod_brain_v2",
        }
        self._active_module_id: Optional[str] = None
        self._module_metadata = {
            "mod_chest_xray_v2": {
                "name": "Chest Radiograph Pathology Classifier",
                "version": "2.4.1",
                "architecture": "ResNet-50 Thoracic",
                "modality": "Chest X-ray",
                "labels": ["Normal", "Pneumonia", "Effusion", "Infiltration", "Atelectasis", "Cardiomegaly", "Nodule", "Pneumothorax"],
                "class_path": "backend.app.ml.models.chest_xray_module.ChestXRayModule"
            },
            "mod_retinal_v2": {
                "name": "Retinal Fundus Microvascular Analyzer",
                "version": "2.1.0",
                "architecture": "ResNet-50 Retinal",
                "modality": "Retinal Fundus",
                "labels": ["No DR", "Mild NPDR", "Moderate NPDR", "Severe NPDR", "Proliferative DR"],
                "class_path": "backend.app.ml.models.retinal_module.RetinalModule"
            },
            "mod_skin_v2": {
                "name": "Dermoscopic Lesion Multi-Class Network",
                "version": "2.2.0",
                "architecture": "ResNet-50 Dermoscopy",
                "modality": "Skin Lesion",
                "labels": ["Melanoma", "Nevus", "Basal Cell Carcinoma", "Actinic Keratosis", "Benign Keratosis", "Dermatofibroma", "Vascular"],
                "class_path": "backend.app.ml.models.skin_lesion_module.SkinLesionModule"
            },
            "mod_bone_v2": {
                "name": "Musculoskeletal Cortical Fracture Detector",
                "version": "1.9.5",
                "architecture": "ResNet-50 Orthopedic",
                "modality": "Bone X-ray",
                "labels": ["No Fracture Detected", "Cortical Fracture Detected"],
                "class_path": "backend.app.ml.models.bone_xray_module.BoneXRayModule"
            },
            "mod_brain_v2": {
                "name": "Neuro-Oncology MRI Differential Classifier",
                "version": "2.3.0",
                "architecture": "ResNet-50 Neuro",
                "modality": "Brain MRI",
                "labels": ["Glioma", "Meningioma", "No Tumor", "Pituitary"],
                "class_path": "backend.app.ml.models.brain_mri_module.BrainMRIModule"
            },
        }

    def _get_or_create_module(self, module_id: str) -> Optional[Any]:
        if module_id in self._modules:
            return self._modules[module_id]

        meta = self._module_metadata.get(module_id)
        if not meta:
            return None

        # Dynamically import module class only when actually requested
        module_path, class_name = meta["class_path"].rsplit(".", 1)
        mod_imported = __import__(module_path, fromlist=[class_name])
        cls_obj = getattr(mod_imported, class_name)
        instance = cls_obj()
        self._modules[module_id] = instance
        return instance

    def _manage_memory_for_module(self, target_module_id: str) -> None:
        if self._active_module_id and self._active_module_id != target_module_id:
            active_mod = self._modules.get(self._active_module_id)
            if active_mod:
                try:
                    active_mod.unload_model()
                except Exception:
                    pass
            gc.collect()
        self._active_module_id = target_module_id

    def get_module_for_modality(self, modality: str) -> Optional[Any]:
        module_id = self._modality_map.get(modality, "mod_chest_xray_v2")
        mod = self._get_or_create_module(module_id) or self._get_or_create_module("mod_chest_xray_v2")
        if mod:
            self._manage_memory_for_module(mod.module_id)
        return mod

    def get_module_by_id(self, module_id: str) -> Optional[Any]:
        mod = self._get_or_create_module(module_id)
        if mod:
            self._manage_memory_for_module(mod.module_id)
        return mod

    def list_modules(self) -> List[Dict[str, Any]]:
        result = []
        for mod_id, meta in self._module_metadata.items():
            result.append({
                "model_id": mod_id,
                "name": meta["name"],
                "version": meta["version"],
                "architecture": meta["architecture"],
                "modality": meta["modality"],
                "labels": meta["labels"],
                "is_installed": True,
                "is_active": True,
                "status": "Ready"
            })
        return result

# Global registry singleton (zero memory overhead on import)
model_registry = ModelRegistry()
