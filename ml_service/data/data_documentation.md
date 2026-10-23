# Dataset Documentation — AgriBudget ML Service

## 1. Crop Recommendation Dataset

| Field | Value |
|-------|-------|
| **Name** | Crop Recommendation Dataset |
| **Source** | Kaggle — Atharva Ingle, https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset |
| **License** | CC0 Public Domain |
| **Retrieval date** | 2024 (dataset published 2020, last updated 2020) |
| **Geographic coverage** | India (aggregated from soil health card data and weather records) |
| **Time period** | Not explicitly stated; reflects typical agronomic ranges rather than a single year |
| **File** | `crop_recommendation_dataset.csv` |
| **Rows** | 2,200 |
| **Classes** | 22 crops (100 samples each) |

### Features

| Column | Unit | Description |
|--------|------|-------------|
| N | kg/ha | Ratio of Nitrogen content in soil |
| P | kg/ha | Ratio of Phosphorus content in soil |
| K | kg/ha | Ratio of Potassium content in soil |
| temperature | °C | Temperature |
| humidity | % | Relative humidity |
| ph | — | pH value of the soil (0–14) |
| rainfall | mm | Rainfall |
| label | — | **Target**: crop name (22 classes) |

### Target Variable
`label` — the recommended crop given the soil and weather conditions. Each of the 22 classes has exactly 100 samples.

### Known Limitations
- The dataset represents **average** conditions per crop, not geographically or temporally specific observations.
- No state, district, or year column — geographic and temporal generalization cannot be assessed.
- 100 samples per class is sufficient for a baseline classifier but not for sub-class analysis by region or season.
- `state` and `season` inputs collected by the frontend **cannot** be used as model features because this dataset does not contain them.
- Financial estimates (yield base, price, cost) are **NOT** derived from this dataset. They are sourced separately (see below).

### Preprocessing Steps
1. Load CSV.
2. Drop any duplicate rows.
3. Check for and assert no missing values.
4. Stratified train / validation / test split: 70% / 15% / 15%.
5. Feature scaling via `StandardScaler` fit on **training set only**.
6. Scaler is saved alongside the model as part of the `sklearn.pipeline.Pipeline`.

---

## 2. Financial Reference Data (Yield & Profit Estimation)

Financial figures are **not derived from a trained ML model**. They are reference values from authoritative Indian agricultural sources, clearly labelled as estimates.

### Yield Base Values
| Source | Description |
|--------|-------------|
| ICRISAT (International Crops Research Institute for the Semi-Arid Tropics) | Average yield per hectare for major Indian crops, district-level data |
| Ministry of Agriculture & Farmers Welfare, GoI — Agricultural Statistics at a Glance | National average yields by crop and state |
| FAOSTAT | India crop production statistics (cross-reference) |

Values used are **national averages** (not Gujarat-specific) as district-level data was not available in a freely downloadable, machine-readable format at the time of this implementation.

### Market Price Values
| Source | Description |
|--------|-------------|
| NAFED / Agmarknet | Modal prices for major crops at major mandis |
| MSP notifications, Government of India | Minimum Support Prices as floor references |

**Important**: Prices are approximate reference values from 2023–2024 and will change. They are labelled with a disclaimer and price basis (₹ per quintal) in every API response.

### Limitations
- All financial figures are **estimates, not predictions**.
- Actual yield varies significantly with variety, soil health, irrigation availability, pest pressure, weather, and farming practices.
- Market prices fluctuate daily; the values used are approximate modal prices and should not be used for business decisions without consulting local mandi rates.
- A genuinely trained yield prediction model would require crop × region × year × weather labelled training data, which was not available in this repository.

---

## 3. What Would Be Needed for a Genuine Yield ML Model

To train a defensible ML yield predictor for Indian conditions, the following data would be required:

| Data | Source | Availability |
|------|--------|-------------|
| District-level crop production (area, production, yield) per year | GoI Directorate of Economics & Statistics | Partially public (some years) |
| District-level rainfall (IMD gridded data) | IMD Open Data | Available but not in this repo |
| District-level temperature | IMD | Available but not in this repo |
| Soil properties by district | NBSS&LUP Soil Health Cards | Partially available |
| Input costs by crop and region | CACP / state agriculture departments | Limited availability |

Until this data is assembled and joined, the yield service returns honest formula-based estimates clearly labelled as such.
