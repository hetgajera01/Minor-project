"""
Crop Recommender Model — scikit-learn RandomForestClassifier
============================================================
Dataset : Kaggle Crop Recommendation Dataset (CC0 Public Domain)
          2,200 samples · 22 crops · 7 features
          Source: https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset

Features used by model: N, P, K, temperature, humidity, ph, rainfall
Features collected but NOT used (dataset lacks them): location, season

To regenerate with proper held-out evaluation, run:
    python train_crop_model.py

MODEL_VERSION is embedded in every response for traceability.
"""

import os
import json
import numpy as np
from typing import Dict, Any

try:
    import joblib
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import StratifiedShuffleSplit
    from sklearn.metrics import accuracy_score, f1_score
    from sklearn.dummy import DummyClassifier
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

# ── Paths ────────────────────────────────────────────────────────────────────
_DIR       = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_DIR, "crop_model.pkl")
META_PATH  = os.path.join(_DIR, "model_metadata.json")

# ── Input validation bounds ──────────────────────────────────────────────────
# Physically plausible ranges for each feature (agronomically defensible).
VALID_RANGES = {
    "N":           (0,   300),    # kg/ha nitrogen
    "P":           (0,   150),    # kg/ha phosphorus
    "K":           (0,   210),    # kg/ha potassium
    "temperature": (5,   50),     # °C
    "humidity":    (5,   100),    # %
    "ph":          (3.0, 10.0),   # soil pH
    "rainfall":    (10,  400),    # mm
    "landArea":    (0.01, 500),   # hectares
}

# ── Financial reference data ─────────────────────────────────────────────────
# Source: Agmarknet modal prices + MSP notifications (GoI) 2023-24 season.
# Unit: price_per_quintal (₹/quintal = ₹/100 kg).
# 1 tonne = 10 quintals.  Revenue = yield_tonnes × 10 × price_per_quintal.
# yield_base: national average (ICRISAT / MoAFW Statistics at a Glance 2023).
# cost_base: estimated cultivation cost per hectare (CACP 2023-24).
CROP_FINANCIALS = {
    "rice":        {"price_per_quintal": 2183,  "yield_base_t_ha": 3.5,  "cost_base_per_ha": 45000, "price_source": "MSP 2023-24"},
    "maize":       {"price_per_quintal": 1962,  "yield_base_t_ha": 3.1,  "cost_base_per_ha": 32000, "price_source": "MSP 2023-24"},
    "chickpea":    {"price_per_quintal": 5440,  "yield_base_t_ha": 1.1,  "cost_base_per_ha": 28000, "price_source": "MSP 2023-24"},
    "kidneybeans": {"price_per_quintal": 6000,  "yield_base_t_ha": 1.0,  "cost_base_per_ha": 30000, "price_source": "Agmarknet modal 2023"},
    "pigeonpeas":  {"price_per_quintal": 7000,  "yield_base_t_ha": 0.9,  "cost_base_per_ha": 28000, "price_source": "MSP 2023-24"},
    "mothbeans":   {"price_per_quintal": 5900,  "yield_base_t_ha": 0.6,  "cost_base_per_ha": 20000, "price_source": "Agmarknet modal 2023"},
    "mungbean":    {"price_per_quintal": 8558,  "yield_base_t_ha": 0.8,  "cost_base_per_ha": 25000, "price_source": "MSP 2023-24"},
    "blackgram":   {"price_per_quintal": 6950,  "yield_base_t_ha": 0.8,  "cost_base_per_ha": 25000, "price_source": "MSP 2023-24"},
    "lentil":      {"price_per_quintal": 6000,  "yield_base_t_ha": 0.9,  "cost_base_per_ha": 24000, "price_source": "MSP 2023-24"},
    "pomegranate": {"price_per_quintal": 8000,  "yield_base_t_ha": 8.0,  "cost_base_per_ha": 70000, "price_source": "Agmarknet modal 2023"},
    "banana":      {"price_per_quintal": 2000,  "yield_base_t_ha": 25.0, "cost_base_per_ha": 70000, "price_source": "Agmarknet modal 2023"},
    "mango":       {"price_per_quintal": 4000,  "yield_base_t_ha": 7.0,  "cost_base_per_ha": 55000, "price_source": "Agmarknet modal 2023"},
    "grapes":      {"price_per_quintal": 6000,  "yield_base_t_ha": 12.0, "cost_base_per_ha": 80000, "price_source": "Agmarknet modal 2023"},
    "watermelon":  {"price_per_quintal": 800,   "yield_base_t_ha": 28.0, "cost_base_per_ha": 40000, "price_source": "Agmarknet modal 2023"},
    "muskmelon":   {"price_per_quintal": 1200,  "yield_base_t_ha": 18.0, "cost_base_per_ha": 38000, "price_source": "Agmarknet modal 2023"},
    "apple":       {"price_per_quintal": 10000, "yield_base_t_ha": 8.0,  "cost_base_per_ha": 90000, "price_source": "Agmarknet modal 2023"},
    "orange":      {"price_per_quintal": 3500,  "yield_base_t_ha": 9.0,  "cost_base_per_ha": 50000, "price_source": "Agmarknet modal 2023"},
    "papaya":      {"price_per_quintal": 1200,  "yield_base_t_ha": 28.0, "cost_base_per_ha": 45000, "price_source": "Agmarknet modal 2023"},
    "coconut":     {"price_per_nut": 15,        "nuts_per_ha": 8000,     "cost_base_per_ha": 40000, "price_source": "Agmarknet modal 2023", "unit": "nuts"},
    "cotton":      {"price_per_quintal": 6620,  "yield_base_t_ha": 1.8,  "cost_base_per_ha": 55000, "price_source": "MSP 2023-24"},
    "jute":        {"price_per_quintal": 4500,  "yield_base_t_ha": 2.5,  "cost_base_per_ha": 30000, "price_source": "MSP 2023-24"},
    "coffee":      {"price_per_quintal": 8000,  "yield_base_t_ha": 1.5,  "cost_base_per_ha": 65000, "price_source": "Agmarknet modal 2023"},
}

CROP_DESCRIPTIONS = {
    "rice":        "Staple cereal. Thrives in high humidity, warm temperatures, and high rainfall.",
    "maize":       "Versatile cereal for food, feed, and industrial use. Moderate water needs.",
    "chickpea":    "Drought-tolerant legume. Low water needs, high protein content.",
    "kidneybeans": "Nutritious legume suited to moderate climates with well-drained soil.",
    "pigeonpeas":  "Drought-resistant legume, common in tropical regions. Nitrogen-fixing.",
    "mothbeans":   "Hardy legume for arid and semi-arid conditions. Very low water needs.",
    "mungbean":    "Fast-growing legume with high protein. Suits humid tropical conditions.",
    "blackgram":   "Warm-season legume with high market demand. Suits heavy soils.",
    "lentil":      "Cool-season legume, excellent protein source. Tolerates frost.",
    "pomegranate": "High-value fruit crop. Tolerates drought once established.",
    "banana":      "High-yield tropical fruit. Needs rich soil and consistent moisture.",
    "mango":       "Premium tropical fruit with strong domestic and export demand.",
    "grapes":      "High-value cash crop. Suited to warm, dry climates with good drainage.",
    "watermelon":  "Fast-growing summer fruit. High market demand in summer months.",
    "muskmelon":   "Summer fruit crop with good returns in a short growing period.",
    "apple":       "Cool-climate premium fruit with high market value. Long-term crop.",
    "orange":      "Citrus fruit with consistent demand and well-established markets.",
    "papaya":      "Tropical fruit with quick returns and continuous harvest cycle.",
    "coconut":     "Long-term plantation crop with diverse food and industrial uses.",
    "cotton":      "Major commercial fibre crop. Strong textile industry demand.",
    "jute":        "Natural fibre crop. Eco-friendly alternative to synthetic fibres.",
    "coffee":      "High-value beverage crop. Suited to humid tropical highlands.",
}

# ── Minimal training data (22 crops, used only if pkl is missing) ─────────────
# This is a representative sample used to build the pkl on first run.
# The full 2200-row training with proper evaluation is done by train_crop_model.py.
_MINIMAL_DATASET = [
    [90,42,43,20.87,82.00,6.50,202.93,"rice"],[85,58,41,21.77,80.31,7.03,226.65,"rice"],
    [60,55,44,23.00,82.32,7.84,263.96,"rice"],[74,35,40,26.49,80.15,6.98,242.86,"rice"],
    [78,42,42,20.13,81.60,7.62,262.72,"rice"],[69,37,42,23.05,83.37,7.07,251.82,"rice"],
    [69,55,38,22.49,80.26,5.84,271.30,"rice"],[94,53,40,24.30,80.60,6.32,201.17,"rice"],
    [89,54,38,24.51,78.27,5.75,237.85,"rice"],[68,58,38,23.39,82.27,5.70,220.58,"rice"],
    [77,52,17,22.61,65.96,6.61,67.63,"maize"],[72,57,19,23.43,59.08,7.32,65.50,"maize"],
    [75,57,21,22.23,60.91,7.70,72.60,"maize"],[82,47,20,25.34,59.09,7.10,63.70,"maize"],
    [84,54,18,25.73,60.72,7.06,81.78,"maize"],[71,43,20,22.44,67.37,6.30,71.30,"maize"],
    [40,67,19,17.37,16.44,7.15,63.97,"chickpea"],[35,68,15,19.45,17.98,7.31,68.11,"chickpea"],
    [38,69,16,18.87,16.11,7.63,66.50,"chickpea"],[38,66,15,21.66,17.65,7.18,67.14,"chickpea"],
    [37,73,18,19.72,18.65,7.61,57.97,"chickpea"],[37,62,21,20.14,19.43,7.14,71.30,"chickpea"],
    [20,67,20,19.58,18.57,5.67,105.71,"kidneybeans"],[20,57,17,19.89,16.59,5.95,117.60,"kidneybeans"],
    [23,59,21,21.25,20.44,6.11,100.17,"kidneybeans"],[20,51,17,20.43,16.86,6.58,101.56,"kidneybeans"],
    [20,67,20,26.83,48.11,5.72,149.46,"pigeonpeas"],[20,51,20,27.86,48.52,6.11,151.72,"pigeonpeas"],
    [21,55,20,27.04,46.32,5.89,146.93,"pigeonpeas"],[20,65,19,26.00,47.00,5.80,148.00,"pigeonpeas"],
    [20,40,20,28.20,53.15,3.51,51.43,"mothbeans"],[20,39,20,28.74,52.68,3.71,49.24,"mothbeans"],
    [20,35,20,27.96,53.48,3.60,50.00,"mothbeans"],[20,38,20,28.00,52.00,3.55,51.00,"mothbeans"],
    [20,40,20,28.24,85.50,6.54,48.43,"mungbean"],[20,37,20,26.41,81.49,6.83,51.73,"mungbean"],
    [20,41,20,27.13,83.05,6.72,49.50,"mungbean"],[20,39,20,27.00,82.00,6.60,50.00,"mungbean"],
    [40,67,19,30.00,68.54,7.28,67.68,"blackgram"],[40,68,20,29.46,69.56,7.11,68.22,"blackgram"],
    [39,70,19,30.00,68.00,7.20,67.00,"blackgram"],[40,65,20,29.00,69.00,7.15,68.00,"blackgram"],
    [18,58,19,18.83,64.93,6.91,46.48,"lentil"],[19,65,18,18.92,66.55,6.28,46.40,"lentil"],
    [18,60,19,19.00,65.00,6.60,46.00,"lentil"],[19,62,18,18.50,65.50,6.80,47.00,"lentil"],
    [18,18,40,21.59,90.10,6.09,107.46,"pomegranate"],[18,18,42,22.40,89.86,6.65,115.55,"pomegranate"],
    [18,19,41,22.00,90.00,6.30,110.00,"pomegranate"],[17,18,40,21.00,89.00,6.50,108.00,"pomegranate"],
    [100,82,50,27.38,80.38,5.98,100.32,"banana"],[102,82,50,25.83,79.93,6.12,102.55,"banana"],
    [100,80,50,27.00,80.00,6.00,100.00,"banana"],[98,81,49,26.50,79.50,6.10,101.00,"banana"],
    [20,27,30,31.20,50.20,5.76,94.70,"mango"],[20,29,30,29.90,50.71,6.10,101.71,"mango"],
    [20,28,30,30.00,50.00,5.90,97.00,"mango"],[21,27,29,31.00,50.50,5.80,95.00,"mango"],
    [23,132,200,23.84,81.97,6.00,69.61,"grapes"],[22,130,200,23.28,80.66,6.20,69.86,"grapes"],
    [23,131,200,23.50,81.00,6.10,69.00,"grapes"],[22,132,199,24.00,80.50,6.00,70.00,"grapes"],
    [99,59,50,25.59,85.16,6.48,50.79,"watermelon"],[100,59,50,24.02,87.98,6.58,53.23,"watermelon"],
    [99,60,50,25.00,86.00,6.50,51.00,"watermelon"],[100,58,50,24.50,85.50,6.55,52.00,"watermelon"],
    [100,17,50,28.65,92.35,6.34,24.68,"muskmelon"],[100,17,50,27.79,93.23,6.64,25.34,"muskmelon"],
    [100,17,50,28.00,92.00,6.50,25.00,"muskmelon"],[99,17,50,28.50,92.50,6.40,24.50,"muskmelon"],
    [20,134,199,22.27,92.23,5.79,113.04,"apple"],[21,132,200,21.93,93.38,5.89,110.93,"apple"],
    [20,133,199,22.00,92.00,5.85,112.00,"apple"],[20,134,200,21.50,93.00,5.80,111.00,"apple"],
    [20,10,10,22.92,92.91,7.00,110.38,"orange"],[20,10,10,22.62,91.68,6.72,107.68,"orange"],
    [20,10,10,22.00,92.00,6.90,109.00,"orange"],[21,10,10,23.00,91.50,6.80,110.00,"orange"],
    [49,59,50,33.49,92.01,6.74,142.63,"papaya"],[49,54,50,33.25,92.58,6.73,130.92,"papaya"],
    [49,56,50,33.00,92.00,6.70,136.00,"papaya"],[50,57,50,33.50,92.50,6.75,140.00,"papaya"],
    [22,16,30,27.42,94.88,5.98,175.69,"coconut"],[23,17,30,25.99,94.64,5.82,178.34,"coconut"],
    [22,16,30,27.00,94.00,5.90,176.00,"coconut"],[23,17,30,26.50,94.50,5.85,177.00,"coconut"],
    [117,46,20,23.98,79.89,6.84,80.55,"cotton"],[120,47,20,24.72,80.02,7.02,78.31,"cotton"],
    [115,45,20,23.50,79.50,6.90,81.00,"cotton"],[118,46,20,24.00,80.00,6.95,79.00,"cotton"],
    [78,46,29,24.96,79.84,6.74,174.89,"jute"],[72,46,29,25.01,79.59,6.47,175.60,"jute"],
    [75,46,29,25.00,79.70,6.60,175.00,"jute"],[76,47,29,24.50,80.00,6.70,174.00,"jute"],
    [101,28,29,25.54,58.98,6.82,158.07,"coffee"],[102,29,29,26.00,59.00,6.80,160.00,"coffee"],
    [100,27,29,25.00,58.50,6.85,157.00,"coffee"],[101,28,30,25.50,59.50,6.78,159.00,"coffee"],
]

FEATURE_NAMES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
MODEL_VERSION = "2.0"


# ── Helper functions ──────────────────────────────────────────────────────────

def _validate_input(inputs: Dict[str, Any]) -> list:
    """Return list of validation error strings (empty = valid)."""
    errors = []
    for field, (lo, hi) in VALID_RANGES.items():
        val = inputs.get(field)
        if val is None:
            continue
        try:
            val = float(val)
        except (TypeError, ValueError):
            errors.append(f"{field} must be a number")
            continue
        if val < lo or val > hi:
            errors.append(
                f"{field}={val} is outside the valid range [{lo}, {hi}]. "
                f"Please check units ({_units(field)})."
            )
    return errors


def _units(field: str) -> str:
    return {"N": "kg/ha", "P": "kg/ha", "K": "kg/ha",
            "temperature": "°C", "humidity": "%", "ph": "unitless 0-14",
            "rainfall": "mm", "landArea": "hectares"}.get(field, "")


def estimate_financials(crop_name: str, land_area: float) -> dict:
    """
    Calculate estimated revenue, cost, and profit.

    Formula (non-coconut crops):
        yield_tonnes = yield_base_t_ha × land_area_ha
        revenue      = yield_tonnes × 10 × price_per_quintal
                       (1 tonne = 10 quintals)
        cost         = cost_base_per_ha × land_area_ha
        profit       = revenue - cost

    Financial figures are ESTIMATES based on average Indian market data.
    They are NOT predictions from a trained ML model.
    """
    f = CROP_FINANCIALS.get(crop_name)
    if f is None:
        # Unknown crop — cannot produce defensible estimates
        return {
            "yieldTons": None, "costEst": None,
            "revenueEst": None, "profitEst": None,
            "pricePerQuintal": None, "priceSource": "Unknown crop",
            "financialNote": "Financial estimates not available for this crop.",
        }

    if f.get("unit") == "nuts":
        # Coconut is counted in nuts, priced per nut
        total_nuts = round(f["nuts_per_ha"] * land_area)
        revenue    = round(total_nuts * f["price_per_nut"])
        cost       = round(f["cost_base_per_ha"] * land_area)
        return {
            "yieldTons": total_nuts,
            "yieldUnit": "nuts",
            "costEst": cost,
            "revenueEst": revenue,
            "profitEst": revenue - cost,
            "pricePerUnit": f["price_per_nut"],
            "priceUnit": "₹/nut",
            "priceSource": f["price_source"],
            "financialNote": (
                "Yield shown in number of coconuts. "
                "Price: ₹{}/nut ({}). These are reference estimates, not guarantees."
            ).format(f["price_per_nut"], f["price_source"]),
        }

    yield_t   = round(f["yield_base_t_ha"] * land_area, 2)
    # CORRECT formula: 1 tonne = 10 quintals
    revenue   = round(yield_t * 10 * f["price_per_quintal"])
    cost      = round(f["cost_base_per_ha"] * land_area)
    profit    = revenue - cost
    return {
        "yieldTons": yield_t,
        "yieldUnit": "tonnes",
        "costEst": cost,
        "revenueEst": revenue,
        "profitEst": profit,
        "pricePerQuintal": f["price_per_quintal"],
        "priceSource": f["price_source"],
        "financialNote": (
            f"Revenue = {yield_t} t × 10 quintals/t × ₹{f['price_per_quintal']}/quintal. "
            f"Price source: {f['price_source']}. "
            "These are reference estimates based on average Indian market data, not actual market quotes."
        ),
    }


def _load_metadata() -> dict:
    if os.path.exists(META_PATH):
        try:
            with open(META_PATH) as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _prepare_minimal():
    X = np.array([[r[0],r[1],r[2],r[3],r[4],r[5],r[6]] for r in _MINIMAL_DATASET], dtype=float)
    y = np.array([r[7] for r in _MINIMAL_DATASET])
    return X, y


def _train_minimal():
    """
    Fast fallback training on minimal dataset.
    Used ONLY when crop_model.pkl is absent.
    Run train_crop_model.py for the proper 2200-row evaluation.
    """
    X, y = _prepare_minimal()
    # Proper split even for minimal data
    if len(set(y)) >= 2 and len(X) > 20:
        sss = StratifiedShuffleSplit(n_splits=1, test_size=0.20, random_state=42)
        for train_idx, test_idx in sss.split(X, y):
            X_train, X_test = X[train_idx], X[test_idx]
            y_train, y_test = y[train_idx], y[test_idx]
    else:
        X_train, y_train = X, y
        X_test, y_test   = X, y

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    RandomForestClassifier(
            n_estimators=200, max_depth=None,
            random_state=42, n_jobs=-1,
        )),
    ])
    pipeline.fit(X_train, y_train)

    test_acc = accuracy_score(y_test, pipeline.predict(X_test))
    test_f1  = f1_score(y_test, pipeline.predict(X_test), average="macro", zero_division=0)

    # Baseline for comparison
    dummy = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
    base_acc = accuracy_score(y_test, dummy.predict(X_test))

    print(f"[CropRecommender] Minimal-dataset training done.")
    print(f"  Test accuracy (minimal, {len(X_test)} samples): {test_acc*100:.1f}%  [baseline: {base_acc*100:.1f}%]")
    print(f"  Test macro-F1 (minimal): {test_f1*100:.1f}%")
    print(f"  ⚠ Run train_crop_model.py for full 2200-row evaluation.")

    # Retrain on full minimal set for serving
    pipeline.fit(X, y)
    return pipeline, {
        "minimal_test_accuracy": round(test_acc, 4),
        "minimal_test_macro_f1": round(test_f1, 4),
        "baseline_test_accuracy": round(base_acc, 4),
        "note": "Minimal dataset. Run train_crop_model.py for proper 2200-row evaluation.",
    }


# ── CropRecommender class ─────────────────────────────────────────────────────

class CropRecommender:
    """
    Crop recommender backed by a scikit-learn RandomForestClassifier.

    The model predicts which of 22 crops best matches the provided soil and
    weather parameters.  It does NOT use location or season — those fields
    are collected by the frontend but are absent from the training dataset.

    Suitability scores come from predict_proba.  They are NOT calibrated
    success probabilities; they indicate how similar the input is to the
    training distribution for each crop.
    """

    def __init__(self):
        self.pipeline: Pipeline | None = None
        self.classes:  list = []
        self.metadata: dict = {}
        self._load_or_train()

    # ── Initialisation ────────────────────────────────────────────────────

    def _load_or_train(self):
        if not SKLEARN_AVAILABLE:
            print("[CropRecommender] scikit-learn unavailable — using fallback.")
            return

        if os.path.exists(MODEL_PATH):
            try:
                self.pipeline  = joblib.load(MODEL_PATH)
                self.classes   = list(self.pipeline.classes_)
                self.metadata  = _load_metadata()
                src = self.metadata.get("trained_at", "unknown date")
                print(f"[CropRecommender] Loaded crop_model.pkl (trained {src}, {len(self.classes)} crops).")
                return
            except Exception as e:
                print(f"[CropRecommender] Failed to load pkl ({e}). Retraining on minimal data…")

        print("[CropRecommender] crop_model.pkl not found. Training on minimal dataset…")
        print("  → For proper evaluation run:  python train_crop_model.py")
        try:
            self.pipeline, metrics = _train_minimal()
            self.classes = list(self.pipeline.classes_)
            joblib.dump(self.pipeline, MODEL_PATH)
            self.metadata = {
                "model_version": MODEL_VERSION,
                "metrics": metrics,
                "features": FEATURE_NAMES,
                "note": "Minimal training. Run train_crop_model.py for full evaluation."
            }
            with open(META_PATH, "w") as f:
                json.dump(self.metadata, f, indent=2)
        except Exception as e:
            print(f"[CropRecommender] Training failed ({e}). Using rule-based fallback.")
            self.pipeline = None

    # ── Public predict ─────────────────────────────────────────────────────

    def predict(self, inputs: Dict[str, Any]) -> dict:
        # 1. Input validation
        errors = _validate_input(inputs)
        if errors:
            return {
                "status":  "validation_error",
                "errors":  errors,
                "message": "Please correct the highlighted inputs and try again.",
            }

        land_area = max(0.01, float(inputs.get("landArea", 1.0) or 1.0))

        # Check required fields
        required = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
        missing = [f for f in required if inputs.get(f) is None or inputs.get(f) == ""]
        if missing:
            return {
                "status":  "validation_error",
                "errors":  [f"{f} is required" for f in missing],
                "message": "All soil and weather parameters are required.",
            }

        features = np.array([[
            float(inputs["N"]),
            float(inputs["P"]),
            float(inputs["K"]),
            float(inputs["temperature"]),
            float(inputs["humidity"]),
            float(inputs["ph"]),
            float(inputs["rainfall"]),
        ]])

        if self.pipeline is not None:
            return self._ml_predict(features, land_area, inputs)
        else:
            return self._fallback_predict(inputs, land_area)

    # ── ML prediction ─────────────────────────────────────────────────────

    def _ml_predict(self, features: np.ndarray, land_area: float, raw_inputs: dict) -> dict:
        proba      = self.pipeline.predict_proba(features)[0]
        sorted_idx = np.argsort(proba)[::-1]

        top_crop = self.classes[sorted_idx[0]]
        top_prob = float(proba[sorted_idx[0]])

        financials = estimate_financials(top_crop, land_area)

        # Suitability label (NOT a calibrated probability)
        if top_prob >= 0.75:
            suitability = "High"
        elif top_prob >= 0.40:
            suitability = "Medium"
        else:
            suitability = "Low"

        # Warn if no class dominates (confused / boundary input)
        warning = None
        if top_prob < 0.30:
            warning = (
                "The model has low confidence for this input combination. "
                "Your parameters may be near the boundary between several crops, "
                "or outside the typical range seen in training data. "
                "Please consult your local Krishi Vigyan Kendra (KVK)."
            )

        # Note about location/season not being used
        location_note = None
        if raw_inputs.get("location") or raw_inputs.get("season"):
            location_note = (
                "Note: Location and season were recorded but are NOT used by the model. "
                "The training dataset (Kaggle Crop Recommendation) does not include these variables."
            )

        top = {
            "crop":         top_crop.capitalize(),
            "score":        round(top_prob * 100, 1),
            "suitability":  suitability,
            "description":  CROP_DESCRIPTIONS.get(top_crop, ""),
            **financials,
        }

        alternatives = []
        for idx in sorted_idx[1:5]:
            crop = self.classes[idx]
            prob = float(proba[idx])
            if prob > 0.01:
                fin = estimate_financials(crop, land_area)
                alternatives.append({
                    "crop":        crop.capitalize(),
                    "score":       round(prob * 100, 1),
                    "description": CROP_DESCRIPTIONS.get(crop, ""),
                    "yieldTons":   fin.get("yieldTons"),
                    "costEst":     fin.get("costEst"),
                    "revenueEst":  fin.get("revenueEst"),
                    "profitEst":   fin.get("profitEst"),
                })

        meta_metrics = self.metadata.get("metrics", {})
        test_acc     = meta_metrics.get("rf_test_accuracy") or meta_metrics.get("minimal_test_accuracy")

        return {
            "status":       "ok",
            "recommended":  top,
            "alternatives": alternatives,
            "source":       "scikit-learn-randomforest",
            "modelVersion": MODEL_VERSION,
            "testAccuracy": f"{test_acc*100:.1f}%" if test_acc else "not evaluated",
            "scoreMeaning": (
                "The score is a suitability indicator derived from the RandomForest class probability. "
                "It reflects how closely your inputs match the training data distribution for each crop. "
                "It is NOT a calibrated probability of success."
            ),
            "disclaimer": (
                "Suitability scores are based on soil and climate parameters only. "
                "Financial figures are reference estimates (national average yields + "
                "MSP/Agmarknet prices 2023-24) — not guarantees. "
                "Always verify with your local Krishi Vigyan Kendra (KVK) before planting."
            ),
            **({"warning": warning} if warning else {}),
            **({"locationNote": location_note} if location_note else {}),
        }

    # ── Rule-based fallback ────────────────────────────────────────────────

    def _fallback_predict(self, inputs: Dict[str, Any], land_area: float) -> dict:
        """
        Simple agronomic scoring fallback when sklearn is unavailable.
        Scores each crop by how well the input parameters fit typical ranges.
        """
        CROP_RANGES = {
            "rice":        {"N":(60,120),"P":(30,60),"K":(30,60),"temperature":(20,35),"humidity":(70,90),"ph":(5.0,7.5),"rainfall":(100,300)},
            "maize":       {"N":(70,150),"P":(40,70),"K":(20,50),"temperature":(18,32),"humidity":(50,80),"ph":(5.5,7.5),"rainfall":(50,150)},
            "chickpea":    {"N":(20,50),"P":(55,80),"K":(15,25),"temperature":(15,30),"humidity":(10,25),"ph":(6.0,9.0),"rainfall":(50,80)},
            "kidneybeans": {"N":(15,30),"P":(50,75),"K":(15,25),"temperature":(18,25),"humidity":(15,25),"ph":(5.5,7.0),"rainfall":(95,125)},
            "pigeonpeas":  {"N":(15,25),"P":(50,75),"K":(15,25),"temperature":(24,30),"humidity":(40,55),"ph":(5.5,7.0),"rainfall":(140,160)},
            "mothbeans":   {"N":(15,25),"P":[30,50],"K":[15,25],"temperature":(26,32),"humidity":(45,60),"ph":(3.0,5.0),"rainfall":(40,60)},
            "mungbean":    {"N":(15,25),"P":[35,45],"K":[15,25],"temperature":(25,32),"humidity":(75,92),"ph":(6.0,8.0),"rainfall":(40,60)},
            "blackgram":   {"N":(35,45),"P":[60,75],"K":[15,25],"temperature":(27,35),"humidity":(60,75),"ph":(6.5,8.0),"rainfall":(60,75)},
            "lentil":      {"N":(15,25),"P":[55,70],"K":[15,25],"temperature":(15,25),"humidity":(60,70),"ph":(6.0,8.0),"rainfall":(40,50)},
            "cotton":      {"N":(100,130),"P":[40,55],"K":[15,25],"temperature":(22,28),"humidity":(70,85),"ph":(6.0,8.0),"rainfall":(70,90)},
            "jute":        {"N":[65,90],"P":[40,55],"K":[25,35],"temperature":(22,28),"humidity":(73,85),"ph":(6.0,8.0),"rainfall":[165,185]},
            "coffee":      {"N":[90,115],"P":[25,35],"K":[25,35],"temperature":(23,28),"humidity":(53,65),"ph":(6.5,7.5),"rainfall":[150,170]},
        }
        best_crop, best_score = "rice", 0
        for crop, ranges in CROP_RANGES.items():
            score = 0
            for feat, (lo, hi) in ranges.items():
                v = float(inputs.get(feat, 0))
                if lo <= v <= hi:
                    score += 1
            if score > best_score:
                best_score, best_crop = score, crop
        financials = estimate_financials(best_crop, land_area)
        return {
            "status": "ok",
            "recommended": {
                "crop":        best_crop.capitalize(),
                "score":       round(best_score / 7 * 100, 1),
                "suitability": "Low",
                "description": CROP_DESCRIPTIONS.get(best_crop, ""),
                **financials,
            },
            "alternatives": [],
            "source":       "rule-based-fallback",
            "modelVersion": MODEL_VERSION,
            "warning": "ML model (scikit-learn) is unavailable. Showing rule-based estimate only. Results may be inaccurate.",
            "disclaimer": (
                "ML model unavailable. Financial figures are reference estimates only. "
                "Consult your local Krishi Vigyan Kendra (KVK) before making decisions."
            ),
        }
