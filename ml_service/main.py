"""
AgriBudget ML Service — FastAPI
================================
Provides:
  POST /recommend      — crop recommendation (RandomForest, 22 crops, 7 features)
  POST /detect-disease — crop disease detection from leaf image
  GET  /health         — liveness check
  GET  /model-info     — trained model metadata and held-out test metrics

Dataset : Kaggle Crop Recommendation Dataset (CC0 Public Domain)
          https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset
Model   : RandomForestClassifier via sklearn Pipeline (scaler + classifier)
Evaluated on held-out test set — see /model-info or models/model_metadata.json
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
import uvicorn
import os
import json

from models.crop_recommender import CropRecommender, VALID_RANGES
from models.disease_detector import DiseaseDetector

# ── FastAPI app ─────────────────────────────────────────────────────────────

app = FastAPI(
    title       = "AgriBudget ML Service",
    description = (
        "ML inference service for crop recommendation (RandomForest, 22 crops) "
        "and disease detection. All financial figures are reference estimates."
    ),
    version = "2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5000", "http://localhost:3000", "*"],
    allow_methods = ["*"],
    allow_headers = ["*"],
)

# Initialise models once at startup
crop_model    = CropRecommender()
disease_model = DiseaseDetector()

# Load model metadata for /model-info
_META_PATH = os.path.join(os.path.dirname(__file__), "models", "model_metadata.json")


# ── Input schema ─────────────────────────────────────────────────────────────

class CropInput(BaseModel):
    N:           float = Field(..., ge=0,    le=300,  description="Nitrogen content in soil (kg/ha)")
    P:           float = Field(..., ge=0,    le=150,  description="Phosphorus content in soil (kg/ha)")
    K:           float = Field(..., ge=0,    le=210,  description="Potassium content in soil (kg/ha)")
    ph:          float = Field(..., ge=3.0,  le=10.0, description="Soil pH (0–14 scale)")
    temperature: float = Field(..., ge=5,    le=50,   description="Air temperature (°C)")
    humidity:    float = Field(..., ge=5,    le=100,  description="Relative humidity (%)")
    rainfall:    float = Field(..., ge=10,   le=400,  description="Rainfall (mm)")
    landArea:    Optional[float] = Field(1.0, ge=0.01, le=500, description="Land area (hectares)")
    location:    Optional[str]  = Field(None, description="State/location — recorded but not used by model")
    season:      Optional[str]  = Field(None, description="Season — recorded but not used by model")

    model_config = {"json_schema_extra": {
        "example": {
            "N": 90, "P": 42, "K": 43, "temperature": 20.9,
            "humidity": 82.0, "ph": 6.5, "rainfall": 202.9,
            "landArea": 2.0, "location": "Gujarat", "season": "Kharif",
        }
    }}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "AgriBudget ML Service", "version": "2.0.0"}


@app.get("/model-info")
def model_info():
    """
    Return information about the trained model, including:
    - Dataset source and size
    - Evaluation protocol
    - Held-out test accuracy and macro-F1
    - Feature names and valid ranges
    - Limitations
    """
    meta: dict = {}
    if os.path.exists(_META_PATH):
        try:
            with open(_META_PATH) as f:
                meta = json.load(f)
        except Exception:
            pass
    return {
        "model_metadata":  meta,
        "valid_input_ranges": VALID_RANGES,
        "documentation": (
            "Run `python train_crop_model.py` (in ml_service/) to retrain with proper "
            "70/15/15 stratified split and regenerate held-out test metrics."
        ),
    }


@app.post("/recommend")
async def recommend_crop(data: CropInput):
    """
    Recommend the best crop based on soil & weather parameters.

    Returns the top-matching crop plus up to 4 alternatives, with:
    - Suitability score (RandomForest class probability, NOT calibrated)
    - Reference financial estimates (yield, cost, revenue, profit)
    - Clear disclaimers about what the scores mean

    Location and season are accepted but not used (training dataset lacks them).
    """
    try:
        result = crop_model.predict(data.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-disease")
async def detect_disease(image: UploadFile = File(...)):
    """
    Detect crop disease from a leaf image.
    Returns disease name, confidence, symptoms, and treatment advice.
    """
    try:
        contents = await image.read()
        result   = disease_model.predict(contents, image.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
