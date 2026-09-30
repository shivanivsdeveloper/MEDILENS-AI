from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple
import torch
import numpy as np

class MedicalModule(ABC):
    """
    Abstract Base Interface for all MediScan AI Diagnostic Modules.
    """

    @property
    @abstractmethod
    def module_id(self) -> str:
        pass

    @property
    @abstractmethod
    def module_name(self) -> str:
        pass

    @property
    @abstractmethod
    def modality(self) -> str:
        pass

    @property
    @abstractmethod
    def version(self) -> str:
        pass

    @property
    @abstractmethod
    def architecture(self) -> str:
        pass

    @property
    @abstractmethod
    def supported_labels(self) -> List[str]:
        pass

    @property
    @abstractmethod
    def is_installed(self) -> bool:
        pass

    @abstractmethod
    def load_model(self) -> None:
        pass

    def ensure_loaded(self) -> None:
        """Ensures weights are loaded into memory lazily before inference."""
        pass

    def unload_model(self) -> None:
        """Unloads weights and calls garbage collection to free container RAM."""
        pass

    @abstractmethod
    def predict(
        self,
        image_path: str
    ) -> Dict[str, Any]:
        """
        Executes end-to-end preprocessing, model inference, Grad-CAM generation,
        uncertainty scoring, and risk stratification.
        """
        pass
