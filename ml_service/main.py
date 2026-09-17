"""
AgriBudget ML Service — FastAPI
Provides crop recommendation and disease detection endpoints.
Replace the placeholder models with trained scikit-learn/TensorFlow models.
"""
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os

from ml_service.models.crop_recommender import CropRecommender
from ml_service.models.disease_detector import DiseaseDetector

app = FastAPI(
    title="AgriBudget ML Service",
    description="ML inference service for crop recommendation and disease detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models once at startup
crop_model    = CropRecommender()
disease_model = DiseaseDetector()


# ── Schemas ──────────────────────────────────────────────────────────

class CropInput(BaseModel):
    N:           float
    P:           float
    K:           float
    ph:          float
    temperature: float
    humidity:    float
    rainfall:    float
    landArea:    Optional[float] = 1.0
    location:    Optional[str]   = None
    season:      Optional[str]   = None


class Alternative(BaseModel):
    crop:        str
    score:       float
    description: str

class CropResult(BaseModel):
    recommended: dict
    alternatives: List[Alternative]
    source:      str
    disclaimer:  str


# ── Endpoints ─────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "AgriBudget ML Service"}


@app.post("/recommend")
async def recommend_crop(data: CropInput):
    """
    Recommend the best crop based on soil & weather parameters.
    Returns top crop + 4 alternatives with financial estimates.
    """
    try:
        result = crop_model.predict(data.dict())
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
        # Read image bytes
        contents = await image.read()
        result = disease_model.predict(contents, image.filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
