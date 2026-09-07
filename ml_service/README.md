# AgriBudget ML Service — Python

This is the Python FastAPI inference service for AgriBudget's AI/ML features.

## Setup

```bash
cd ml_service
pip install -r requirements.txt
python main.py
```

Or use the convenience script:
```
start.bat
```

The service runs on **http://localhost:8000** by default.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/recommend` | Crop recommendation (soil + weather → best crop) |
| POST | `/detect-disease` | Disease detection from leaf image |

## Upgrading Models

### Crop Recommender (`models/crop_recommender.py`)
Currently uses a scoring engine. To use a trained model:
1. Train `scikit-learn` RandomForest on the [Kaggle Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset)
2. Save: `joblib.dump(model, 'crop_model.pkl')`
3. In `__init__`: `self.model = joblib.load('crop_model.pkl')`
4. In `predict()`: use `self.model.predict(features)`

### Disease Detector (`models/disease_detector.py`)
Currently a placeholder. To use a real model:
1. Train EfficientNet-B0 on [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) (38 classes)
2. Export to ONNX/TorchScript
3. Replace `predict()` with real inference code
