"""
Disease Detector Model
Uses Gemini Vision API via the Node.js backend (preferred).
This Python file serves as a lightweight fallback for the /detect-disease endpoint.

Fixed: removed emoji characters that crash on Windows CP1252 terminals.
"""
import io
from typing import Dict, Any

# Known disease database for fallback
DISEASE_INFO = {
    "Tomato__Early_Blight": {
        "detectedCrop": "Tomato", "disease": "Early Blight", "confidence": 0,
        "isHealthy": False,
        "symptoms": ["Dark brown concentric ring spots on older leaves", "Yellow halo around spots", "Leaves turn yellow and drop"],
        "causes": ["Fungal pathogen Alternaria solani", "Warm, humid conditions", "Poor plant spacing"],
        "prevention": ["Use certified disease-free seeds", "Maintain proper plant spacing", "Avoid overhead irrigation"],
        "treatment": ["Remove and destroy affected leaves", "Apply Mancozeb (75% WP) at 2g/litre", "Spray Chlorothalonil every 7-10 days"],
        "nextSteps": ["Monitor daily for spread", "Consult local agriculture officer if spread continues"],
    },
    "Wheat__Leaf_Rust": {
        "detectedCrop": "Wheat", "disease": "Leaf Rust", "confidence": 0,
        "isHealthy": False,
        "symptoms": ["Orange-brown pustules on leaves", "Leaves turn yellow and die", "Rust-coloured spore masses"],
        "causes": ["Puccinia triticina fungus", "Cool, moist weather", "Infected crop residue"],
        "prevention": ["Grow rust-resistant varieties", "Avoid late sowing", "Remove crop residue after harvest"],
        "treatment": ["Apply Propiconazole (0.1%) at first sign", "Spray Mancozeb (2.5g/litre)", "Repeat after 15 days if needed"],
        "nextSteps": ["Alert neighboring farmers", "Report severe outbreaks to agriculture department"],
    },
    "Healthy": {
        "detectedCrop": "General", "disease": "Healthy -- No Disease Detected", "confidence": 0,
        "isHealthy": True,
        "symptoms": [],
        "causes": [],
        "prevention": ["Continue regular crop monitoring", "Maintain balanced fertilization"],
        "treatment": [],
        "nextSteps": ["Schedule regular field inspections", "Continue preventive spraying as per crop calendar"],
    },
}


class DiseaseDetector:
    """
    Placeholder disease detector for the Python ML service endpoint.
    
    NOTE: Real disease detection is handled by Gemini Vision API
    directly in the Node.js backend (diseaseService.js).
    This class serves as a fallback if the Node.js Gemini call fails.
    
    TO UPGRADE WITH A LOCAL CNN MODEL:
    1. Train EfficientNet-B0 on PlantVillage dataset (38 disease classes)
    2. Export to ONNX or TorchScript
    3. Replace predict() with real inference code
    """

    def __init__(self):
        self.model = None  # Placeholder
        self.classes = list(DISEASE_INFO.keys())
        print("[DiseaseDetector] Loaded (placeholder - Gemini Vision handles real detection in backend)")

    def predict(self, image_bytes: bytes, filename: str = "") -> Dict[str, Any]:
        """
        Returns a transparent placeholder result.
        Confidence = 0 signals to frontend that model is not loaded.
        Real detection happens via Gemini Vision in Node.js diseaseService.js.
        """
        result = DISEASE_INFO["Healthy"].copy()
        result["confidence"] = 0
        result["source"] = "placeholder-model"
        result["disclaimer"] = (
            "The local disease detection model has not been trained yet. "
            "Please ensure the Gemini API key is configured for AI-powered analysis. "
            "Consult a qualified agricultural expert for important decisions."
        )
        return result
