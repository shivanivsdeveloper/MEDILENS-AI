from typing import Dict, Any, List, Optional
from backend.app.ml.models.module_interface import MedicalModule
from backend.app.ml.models.chest_xray_module import ChestXRayModule
from backend.app.ml.models.retinal_module import RetinalModule
from backend.app.ml.models.skin_lesion_module import SkinLesionModule
from backend.app.ml.models.bone_xray_module import BoneXRayModule
from backend.app.ml.models.brain_mri_module import BrainMRIModule

class ModelRegistry:
    """
    Central Registry for all diagnostic models, managing instantiation,
    routing, benchmarking, and lifecycle operations.
    """

    def __init__(self):
        self._modules: Dict[str, MedicalModule] = {}
        self._modality_map: Dict[str, str] = {}
        self._initialize_modules()

    def _initialize_modules(self):
        # Register core modules
        chest = ChestXRayModule()
        self._modules[chest.module_id] = chest
        self._modality_map["Chest X-ray"] = chest.module_id

        retinal = RetinalModule()
        self._modules[retinal.module_id] = retinal
        self._modality_map["Retinal Fundus"] = retinal.module_id

        skin = SkinLesionModule()
        self._modules[skin.module_id] = skin
        self._modality_map["Skin Lesion"] = skin.module_id

        bone = BoneXRayModule()
        self._modules[bone.module_id] = bone
        self._modality_map["Bone X-ray"] = bone.module_id

        brain = BrainMRIModule()
        self._modules[brain.module_id] = brain
        self._modality_map["Brain MRI"] = brain.module_id

    def get_module_for_modality(self, modality: str) -> Optional[MedicalModule]:
        module_id = self._modality_map.get(modality)
        if module_id and module_id in self._modules:
            return self._modules[module_id]
        # Fallback to Chest X-ray if modality is unknown or general radiographic
        return self._modules.get("mod_chest_xray_v2")

    def get_module_by_id(self, module_id: str) -> Optional[MedicalModule]:
        return self._modules.get(module_id)

    def list_modules(self) -> List[Dict[str, Any]]:
        result = []
        for mod_id, mod in self._modules.items():
            result.append({
                "model_id": mod.module_id,
                "name": mod.module_name,
                "version": mod.version,
                "architecture": mod.architecture,
                "modality": mod.modality,
                "labels": mod.supported_labels,
                "is_installed": mod.is_installed,
                "is_active": True,
                "status": "Ready" if mod.is_installed else "Model Unavailable"
            })
        return result

# Global registry singleton
model_registry = ModelRegistry()
