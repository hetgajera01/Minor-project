/**
 * Crop ML Service
 * ===============
 * Tries the Python FastAPI ML service first; falls back to the Node.js
 * scoring engine when Python is not reachable.
 *
 * Revenue formula (CORRECTED):
 *   revenue = yieldTons × 10 × price_per_quintal
 *   (1 tonne = 10 quintals; price is in ₹/quintal)
 *
 * Financial figures are REFERENCE ESTIMATES based on average Indian
 * agricultural data (MSP / Agmarknet 2023-24). They are NOT guarantees.
 */

import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ─── Financial reference data ────────────────────────────────────────────────
// price_per_quintal : ₹/quintal (MSP or Agmarknet modal price, 2023-24)
// yield_base_t_ha   : national average tonnes/hectare (ICRISAT / MoAFW 2023)
// cost_base_per_ha  : estimated cultivation cost ₹/ha (CACP 2023-24)
//
// Revenue = yieldTons × 10 × price_per_quintal
//           (1 tonne = 10 quintals — do NOT multiply by 1000)
const CROP_DB = {
  Rice:      { price_per_quintal: 2183,  yield_base_t_ha: 3.5,  cost_base_per_ha: 45000, price_source: "MSP 2023-24" },
  Wheat:     { price_per_quintal: 2275,  yield_base_t_ha: 3.5,  cost_base_per_ha: 38000, price_source: "MSP 2023-24" },
  Cotton:    { price_per_quintal: 6620,  yield_base_t_ha: 1.8,  cost_base_per_ha: 55000, price_source: "MSP 2023-24" },
  Maize:     { price_per_quintal: 1962,  yield_base_t_ha: 3.1,  cost_base_per_ha: 32000, price_source: "MSP 2023-24" },
  Sugarcane: { price_per_quintal: 315,   yield_base_t_ha: 70.0, cost_base_per_ha: 80000, price_source: "FRP 2023-24" },
  Soybean:   { price_per_quintal: 4600,  yield_base_t_ha: 1.3,  cost_base_per_ha: 35000, price_source: "MSP 2023-24" },
  Groundnut: { price_per_quintal: 6377,  yield_base_t_ha: 1.7,  cost_base_per_ha: 40000, price_source: "MSP 2023-24" },
  Tomato:    { price_per_quintal: 1500,  yield_base_t_ha: 22.0, cost_base_per_ha: 60000, price_source: "Agmarknet modal 2023" },
  Onion:     { price_per_quintal: 2000,  yield_base_t_ha: 13.0, cost_base_per_ha: 42000, price_source: "Agmarknet modal 2023" },
  Potato:    { price_per_quintal: 1200,  yield_base_t_ha: 18.0, cost_base_per_ha: 55000, price_source: "Agmarknet modal 2023" },
  Chickpea:  { price_per_quintal: 5440,  yield_base_t_ha: 1.1,  cost_base_per_ha: 28000, price_source: "MSP 2023-24" },
  Mustard:   { price_per_quintal: 5650,  yield_base_t_ha: 1.4,  cost_base_per_ha: 30000, price_source: "MSP 2023-24" },
  Lentil:    { price_per_quintal: 6000,  yield_base_t_ha: 0.9,  cost_base_per_ha: 24000, price_source: "MSP 2023-24" },
  Mango:     { price_per_quintal: 4000,  yield_base_t_ha: 7.0,  cost_base_per_ha: 55000, price_source: "Agmarknet modal 2023" },
  Banana:    { price_per_quintal: 2000,  yield_base_t_ha: 25.0, cost_base_per_ha: 70000, price_source: "Agmarknet modal 2023" },
};

// ─── Suitability scoring (Node.js fallback only) ─────────────────────────────
// NPK / weather ranges per crop for a simple rule-based match score.
const CROP_RANGES = {
  Rice:      { N:[60,120], P:[30,60],  K:[30,60],  temp:[20,35], humidity:[70,90], rainfall:[100,300] },
  Wheat:     { N:[80,150], P:[40,80],  K:[40,80],  temp:[10,25], humidity:[50,70], rainfall:[30,100]  },
  Cotton:    { N:[80,120], P:[40,60],  K:[40,80],  temp:[21,37], humidity:[50,80], rainfall:[60,120]  },
  Maize:     { N:[80,150], P:[40,70],  K:[40,70],  temp:[18,32], humidity:[50,80], rainfall:[50,150]  },
  Sugarcane: { N:[100,200],P:[50,100], K:[80,150], temp:[20,38], humidity:[60,90], rainfall:[100,200] },
  Soybean:   { N:[20,40],  P:[40,80],  K:[40,80],  temp:[20,30], humidity:[60,70], rainfall:[60,100]  },
  Groundnut: { N:[20,40],  P:[40,80],  K:[40,80],  temp:[25,35], humidity:[50,70], rainfall:[50,130]  },
  Tomato:    { N:[80,120], P:[50,80],  K:[80,120], temp:[18,28], humidity:[60,80], rainfall:[40,80]   },
  Onion:     { N:[60,100], P:[30,60],  K:[50,100], temp:[15,28], humidity:[50,70], rainfall:[30,80]   },
  Potato:    { N:[80,120], P:[60,100], K:[80,150], temp:[15,25], humidity:[60,80], rainfall:[40,100]  },
  Chickpea:  { N:[20,40],  P:[40,60],  K:[20,40],  temp:[15,29], humidity:[40,65], rainfall:[30,70]   },
  Mustard:   { N:[60,100], P:[30,60],  K:[20,40],  temp:[10,25], humidity:[40,60], rainfall:[30,80]   },
  Lentil:    { N:[20,40],  P:[30,60],  K:[20,40],  temp:[15,28], humidity:[40,65], rainfall:[25,60]   },
  Mango:     { N:[60,100], P:[20,40],  K:[40,80],  temp:[22,38], humidity:[50,80], rainfall:[100,200] },
  Banana:    { N:[100,200],P:[40,80],  K:[120,200],temp:[20,35], humidity:[60,80], rainfall:[100,200] },
};

/**
 * Score how well a value fits within a range.
 * Returns 100 if in-range, decaying towards 0 outside.
 */
function scoreParam(value, [min, max]) {
  if (value >= min && value <= max) return 100;
  if (value < min) return Math.max(0, 100 - ((min - value) / Math.max(min, 1)) * 100);
  return Math.max(0, 100 - ((value - max) / Math.max(max, 1)) * 100);
}

function scoreCrop(rangeData, inputs) {
  const { N, P, K, temperature, humidity, rainfall } = inputs;
  const params = [
    scoreParam(N,           rangeData.N),
    scoreParam(P,           rangeData.P),
    scoreParam(K,           rangeData.K),
    scoreParam(temperature, rangeData.temp),
    scoreParam(humidity,    rangeData.humidity),
    scoreParam(rainfall,    rangeData.rainfall),
  ];
  return Math.round(params.reduce((a, b) => a + b, 0) / params.length);
}

function getSuitability(score) {
  if (score >= 80) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

function getDescription(cropName, score) {
  if (score >= 80) return `Excellent match — soil and climate conditions are highly suitable for ${cropName}.`;
  if (score >= 55) return `Good match — ${cropName} can grow well with minor adjustments to soil or irrigation.`;
  return `Possible but challenging — ${cropName} may need significant amendments for your conditions.`;
}

/**
 * Calculate estimated revenue, cost, profit.
 *
 * CORRECT FORMULA:
 *   revenue = yieldTons × 10 × price_per_quintal
 *   (1 tonne = 10 quintals — the old code multiplied by 1000 which was WRONG)
 *
 * @param {Object} cropData - Entry from CROP_DB
 * @param {number} landArea - Hectares
 * @returns {{ yieldTons, costEst, revenueEst, profitEst, pricePerQuintal, priceSource }}
 */
function estimateFinancials(cropData, landArea = 1) {
  const yieldTons    = +(cropData.yield_base_t_ha * landArea).toFixed(2);
  // 1 tonne = 10 quintals, price is ₹/quintal
  const revenueEst   = Math.round(yieldTons * 10 * cropData.price_per_quintal);
  const costEst      = Math.round(cropData.cost_base_per_ha * landArea);
  const profitEst    = revenueEst - costEst;
  return {
    yieldTons,
    costEst,
    revenueEst,
    profitEst,
    pricePerQuintal: cropData.price_per_quintal,
    priceSource:     cropData.price_source,
    financialNote:   (
      `Revenue = ${yieldTons} t × 10 quintals/t × ₹${cropData.price_per_quintal}/quintal. ` +
      `Price source: ${cropData.price_source}. ` +
      `These are reference estimates based on average Indian data — not actual market quotes.`
    ),
  };
}

/**
 * Node.js suitability scoring engine — used when Python ML service is down.
 * Honest range-matching, not a trained ML model.
 */
function localRecommend(inputs) {
  const landArea = Math.max(0.01, Number(inputs.landArea) || 1);
  const results  = Object.entries(CROP_RANGES).map(([cropName, ranges]) => {
    const score    = scoreCrop(ranges, inputs);
    const dbEntry  = CROP_DB[cropName];
    const fins     = dbEntry ? estimateFinancials(dbEntry, landArea) : {};
    return {
      crop:        cropName,
      score,
      suitability: getSuitability(score),
      description: getDescription(cropName, score),
      ...fins,
    };
  });
  results.sort((a, b) => b.score - a.score);
  const [top, ...rest] = results;

  return {
    status:     'ok',
    recommended: top,
    alternatives: rest.slice(0, 4).map(r => ({
      crop:        r.crop,
      score:       r.score,
      description: r.description,
      yieldTons:   r.yieldTons,
      costEst:     r.costEst,
      revenueEst:  r.revenueEst,
      profitEst:   r.profitEst,
    })),
    source:     'node-scoring-engine',
    modelVersion: 'rule-based-v2',
    scoreMeaning: 'Score reflects how closely your soil and weather parameters match typical growing conditions for each crop. It is not a trained ML output.',
    disclaimer: (
      'Python ML service is not running — using rule-based estimates. ' +
      'Financial figures are reference estimates (MSP / Agmarknet 2023-24). ' +
      'Consult your local Krishi Vigyan Kendra (KVK) before planting.'
    ),
  };
}

/**
 * Validate input ranges before sending to ML service.
 * Returns array of error strings (empty = valid).
 */
function validateInputs(inputs) {
  const BOUNDS = {
    N:           [0,   300],
    P:           [0,   150],
    K:           [0,   210],
    temperature: [5,   50],
    humidity:    [5,   100],
    ph:          [3.0, 10.0],
    rainfall:    [10,  400],
    landArea:    [0.01, 500],
  };
  const errors = [];
  for (const [field, [lo, hi]] of Object.entries(BOUNDS)) {
    const val = inputs[field];
    if (val === null || val === undefined || val === '') continue;
    const n = Number(val);
    if (isNaN(n)) { errors.push(`${field} must be a number`); continue; }
    if (n < lo || n > hi) {
      errors.push(`${field} = ${n} is outside the valid range [${lo}, ${hi}]`);
    }
  }
  return errors;
}

// ─── Main exports ─────────────────────────────────────────────────────────────

/**
 * Crop Recommendation — tries Python ML service, falls back to Node.js engine.
 */
export async function recommendCrop(inputs) {
  // Validate before sending to either service
  const errors = validateInputs(inputs);
  if (errors.length > 0) {
    return {
      status:  'validation_error',
      errors,
      message: 'Please correct the highlighted inputs and try again.',
    };
  }

  try {
    const res = await axios.post(`${ML_SERVICE_URL}/recommend`, inputs, { timeout: 5000 });
    return res.data;
  } catch {
    // Python service not running — use local engine (clearly labelled)
    return localRecommend(inputs);
  }
}

/**
 * Yield & Profit Prediction
 * =========================
 * This is a formula-based estimate, NOT a trained ML model.
 * It uses national-average reference yields and verified MSP/Agmarknet prices.
 *
 * Cost handling:
 *   totalCost = (cost_base_per_ha × landArea) + user-provided additional costs
 *
 *   existingExpenses from the DB are deliberately NOT added here to avoid
 *   double-counting — those expenses are already recorded in the finance tracker.
 *   The breakdown is shown so the farmer can see what was included.
 */
export async function predictYieldAndProfit(inputs) {
  const { crop, landArea = 1, season, additionalCosts = {} } = inputs;
  // Note: existingExpenses intentionally excluded from totalCost (prevents double-counting)

  const cropData = CROP_DB[crop];

  if (!cropData) {
    return {
      status:     'unsupported_crop',
      crop,
      landArea,
      season,
      message:    `"${crop}" is not in the reference database. No estimate available.`,
      supportedCrops: Object.keys(CROP_DB),
      source:     'formula-estimate-v2',
      disclaimer: 'Yield & Profit figures are formula-based reference estimates, not ML predictions.',
    };
  }

  // ── Core calculations ──────────────────────────────────────────────────────
  const yieldPerHa   = cropData.yield_base_t_ha;
  const predictedYield = +(yieldPerHa * landArea).toFixed(2);

  // CORRECT: 1 tonne = 10 quintals; price is ₹/quintal
  const predictedRevenue = Math.round(predictedYield * 10 * cropData.price_per_quintal);

  // Base farming cost from reference data
  const baseFarmingCost = Math.round(cropData.cost_base_per_ha * landArea);

  // User-provided additional costs (kept separate and visible in breakdown)
  const fertilizerCost  = Number(additionalCosts.fertilizer)  || 0;
  const laborCost       = Number(additionalCosts.labor)       || 0;
  const irrigationCost  = Number(additionalCosts.irrigation)  || 0;
  const otherCost       = Number(additionalCosts.other)       || 0;
  const additionalTotal = fertilizerCost + laborCost + irrigationCost + otherCost;

  const predictedCost   = baseFarmingCost + additionalTotal;
  const predictedProfit = predictedRevenue - predictedCost;
  const profitMargin    = predictedRevenue > 0
    ? +(((predictedProfit / predictedRevenue) * 100)).toFixed(1)
    : 0;

  // ── Risk assessment ────────────────────────────────────────────────────────
  let riskLevel  = 'Low';
  let riskReason = 'Reference data suggests positive returns under average conditions.';
  if (profitMargin < 15) {
    riskLevel  = 'High';
    riskReason = 'Low profit margin — costs may exceed revenue if yields or prices are below average.';
  } else if (profitMargin < 30) {
    riskLevel  = 'Medium';
    riskReason = 'Moderate margin — consider negotiating input costs or exploring MSP procurement.';
  }

  // ── Season / location note ─────────────────────────────────────────────────
  const locationNote = (season || inputs.location)
    ? 'Season and location were recorded but do not currently affect this estimate. ' +
      'Reference yields are national averages — actual yields vary by region.'
    : null;

  return {
    status: 'ok',
    crop,
    landArea,
    season,
    predictedYield,
    yieldUnit:        'tonnes',
    yieldBasis:       `${yieldPerHa} t/ha (national average, ICRISAT/MoAFW 2023)`,
    predictedCost:    Math.round(predictedCost),
    predictedRevenue,
    revenueFormula:   `${predictedYield} t × 10 qt/t × ₹${cropData.price_per_quintal}/qt`,
    predictedProfit:  Math.round(predictedProfit),
    profitMargin,
    riskLevel,
    riskReason,
    breakdown: {
      baseFarmingCost,
      fertilizer:  fertilizerCost,
      labor:       laborCost,
      irrigation:  irrigationCost,
      other:       otherCost,
      // existingExpenses NOT included — already in finance tracker
    },
    pricePerQuintal:  cropData.price_per_quintal,
    priceSource:      cropData.price_source,
    priceNote:        `Market price: ₹${cropData.price_per_quintal}/quintal (${cropData.price_source}). Actual mandi prices vary daily.`,
    source:           'formula-estimate-v2',
    modelVersion:     '2.0',
    ...(locationNote ? { locationNote } : {}),
    disclaimer: (
      'ESTIMATE ONLY — not a trained ML model prediction. ' +
      `Yield based on national average (${yieldPerHa} t/ha). ` +
      'Actual results depend on variety, soil health, irrigation, weather, and local market prices. ' +
      'Consult your local Krishi Vigyan Kendra (KVK) before making financial decisions.'
    ),
  };
}
