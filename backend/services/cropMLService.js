/**
 * Crop ML Service
 * Tries Python FastAPI service first, falls back to Node.js scoring engine.
 * Interface is stable — replace the Python model without changing this file's API.
 */
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ─── Crop knowledge base (Indian agriculture focused) ───────────────────────
// NPK ranges, pH, temperature, humidity, rainfall — typical values per crop
const CROP_DB = {
  Rice:      { N:[60,120], P:[30,60],  K:[30,60],  ph:[5.0,7.0], temp:[20,35], humidity:[70,90], rainfall:[100,300], price:2200,  yieldBase:3.5,  costBase:45000 },
  Wheat:     { N:[80,150], P:[40,80],  K:[40,80],  ph:[6.0,7.5], temp:[10,25], humidity:[50,70], rainfall:[30,100],  price:2275,  yieldBase:4.0,  costBase:38000 },
  Cotton:    { N:[80,120], P:[40,60],  K:[40,80],  ph:[6.0,8.0], temp:[21,37], humidity:[50,80], rainfall:[60,120],  price:6500,  yieldBase:1.8,  costBase:55000 },
  Maize:     { N:[80,150], P:[40,70],  K:[40,70],  ph:[5.5,7.5], temp:[18,32], humidity:[50,80], rainfall:[50,150],  price:1850,  yieldBase:5.0,  costBase:32000 },
  Sugarcane: { N:[100,200],P:[50,100], K:[80,150], ph:[6.0,8.0], temp:[20,38], humidity:[60,90], rainfall:[100,200], price:315,   yieldBase:70.0, costBase:80000 },
  Soybean:   { N:[20,40],  P:[40,80],  K:[40,80],  ph:[6.0,7.5], temp:[20,30], humidity:[60,70], rainfall:[60,100],  price:4500,  yieldBase:2.0,  costBase:35000 },
  Groundnut: { N:[20,40],  P:[40,80],  K:[40,80],  ph:[5.5,7.0], temp:[25,35], humidity:[50,70], rainfall:[50,130],  price:5800,  yieldBase:2.5,  costBase:40000 },
  Tomato:    { N:[80,120], P:[50,80],  K:[80,120], ph:[5.5,7.0], temp:[18,28], humidity:[60,80], rainfall:[40,80],   price:1500,  yieldBase:25.0, costBase:60000 },
  Onion:     { N:[60,100], P:[30,60],  K:[50,100], ph:[6.0,7.5], temp:[15,28], humidity:[50,70], rainfall:[30,80],   price:2000,  yieldBase:15.0, costBase:42000 },
  Potato:    { N:[80,120], P:[60,100], K:[80,150], ph:[5.0,6.5], temp:[15,25], humidity:[60,80], rainfall:[40,100],  price:1200,  yieldBase:20.0, costBase:55000 },
  Chickpea:  { N:[20,40],  P:[40,60],  K:[20,40],  ph:[6.0,8.0], temp:[15,29], humidity:[40,65], rainfall:[30,70],   price:5200,  yieldBase:1.5,  costBase:28000 },
  Mustard:   { N:[60,100], P:[30,60],  K:[20,40],  ph:[6.0,7.5], temp:[10,25], humidity:[40,60], rainfall:[30,80],   price:5500,  yieldBase:1.8,  costBase:30000 },
  Lentil:    { N:[20,40],  P:[30,60],  K:[20,40],  ph:[6.0,8.0], temp:[15,28], humidity:[40,65], rainfall:[25,60],   price:6000,  yieldBase:1.2,  costBase:25000 },
  Mango:     { N:[60,100], P:[20,40],  K:[40,80],  ph:[5.5,7.5], temp:[22,38], humidity:[50,80], rainfall:[100,200], price:3500,  yieldBase:8.0,  costBase:35000 },
  Banana:    { N:[100,200],P:[40,80],  K:[120,200],ph:[5.5,7.0], temp:[20,35], humidity:[60,80], rainfall:[100,200], price:1800,  yieldBase:30.0, costBase:70000 },
};

/**
 * Score how well the given input matches a crop's ideal range
 * Returns 0-100
 */
function scoreParam(value, [min, max]) {
  if (value < min) return Math.max(0, 100 - ((min - value) / min) * 100);
  if (value > max) return Math.max(0, 100 - ((value - max) / max) * 100);
  return 100;
}

function scoreCrop(cropData, inputs) {
  const { N, P, K, ph, temperature, humidity, rainfall } = inputs;
  const scores = [
    scoreParam(N,           cropData.N),
    scoreParam(P,           cropData.P),
    scoreParam(K,           cropData.K),
    scoreParam(ph,          cropData.ph),
    scoreParam(temperature, cropData.temp),
    scoreParam(humidity,    cropData.humidity),
    scoreParam(rainfall,    cropData.rainfall),
  ];
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function getConfidence(score) {
  if (score >= 80) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
}

function getDescription(cropName, score) {
  if (score >= 80) return `Excellent match — your soil and climate conditions are highly suitable for ${cropName}.`;
  if (score >= 55) return `Good match — ${cropName} can grow well with minor adjustments to soil or irrigation.`;
  return `Possible but challenging — ${cropName} may need significant soil amendments for your conditions.`;
}

/**
 * Estimate financials from crop DB + land area
 */
function estimateFinancials(cropData, landArea = 1) {
  const yieldTons = +(cropData.yieldBase * landArea).toFixed(2);
  const costEst   = Math.round(cropData.costBase * landArea);
  const revenueEst = Math.round(yieldTons * cropData.price * 1000); // price per quintal → per ton
  const profitEst  = revenueEst - costEst;
  return { yieldTons, costEst, revenueEst, profitEst };
}

/**
 * Node.js scoring engine — transparent, honest estimates
 */
function localRecommend(inputs) {
  const landArea = inputs.landArea || 1;
  const results = Object.entries(CROP_DB).map(([cropName, data]) => {
    const score = scoreCrop(data, inputs);
    const financials = estimateFinancials(data, landArea);
    return {
      crop: cropName,
      score,
      confidence: getConfidence(score),
      description: getDescription(cropName, score),
      ...financials,
    };
  });

  results.sort((a, b) => b.score - a.score);
  const [top, ...rest] = results;

  return {
    recommended: top,
    alternatives: rest.slice(0, 4).map(r => ({
      crop: r.crop,
      score: r.score,
      description: r.description,
    })),
    source: 'node-scoring-engine',
    disclaimer: 'Financial estimates are based on average Indian market data. Actual results may vary based on local conditions, mandi prices, and farming practices.',
  };
}

/**
 * Main export — tries Python ML service, falls back to local engine
 */
export async function recommendCrop(inputs) {
  try {
    const res = await axios.post(`${ML_SERVICE_URL}/recommend`, inputs, { timeout: 5000 });
    return { ...res.data, source: 'python-ml-model' };
  } catch {
    // Python service not running — use local engine (transparent fallback)
    return localRecommend(inputs);
  }
}

/**
 * Yield & Profit Prediction
 * Integrates with existing expense/income data from the DB
 */
export async function predictYieldAndProfit(inputs) {
  const { crop, landArea = 1, season, existingExpenses = 0, additionalCosts = {} } = inputs;
  
  const cropData = CROP_DB[crop];
  if (!cropData) {
    // Estimate generically
    const genericYield = landArea * 2.5;
    const genericCost  = landArea * 40000 + existingExpenses;
    const genericRev   = genericYield * 3000 * 1000;
    return {
      crop,
      landArea,
      season,
      predictedYield: +genericYield.toFixed(2),
      predictedCost:  genericCost + (additionalCosts.fertilizer || 0) + (additionalCosts.labor || 0) + (additionalCosts.irrigation || 0) + (additionalCosts.other || 0),
      predictedRevenue: genericRev,
      predictedProfit:  genericRev - genericCost,
      profitMargin: +(((genericRev - genericCost) / genericRev) * 100).toFixed(1),
      riskLevel: 'Medium',
      riskReason: 'Unknown crop — using average estimates.',
      source: 'generic-estimate',
    };
  }

  const baseYield   = cropData.yieldBase * landArea;
  const baseCost    = cropData.costBase  * landArea;
  const extraCosts  = (additionalCosts.fertilizer || 0) + (additionalCosts.labor || 0) + (additionalCosts.irrigation || 0) + (additionalCosts.other || 0);
  const totalCost   = baseCost + extraCosts + (existingExpenses || 0);
  const revenue     = Math.round(baseYield * cropData.price * 1000);
  const profit      = revenue - totalCost;
  const margin      = revenue > 0 ? +(((profit / revenue) * 100)).toFixed(1) : 0;

  // Risk assessment
  let riskLevel = 'Low';
  let riskReason = 'Well-established crop with predictable returns.';
  if (margin < 15) { riskLevel = 'High'; riskReason = 'Low profit margin — costs may exceed revenue in adverse conditions.'; }
  else if (margin < 30) { riskLevel = 'Medium'; riskReason = 'Moderate margin — consider cost reduction strategies.'; }

  return {
    crop,
    landArea,
    season,
    predictedYield: +baseYield.toFixed(2),
    predictedCost:  Math.round(totalCost),
    predictedRevenue: revenue,
    predictedProfit:  Math.round(profit),
    profitMargin: margin,
    riskLevel,
    riskReason,
    breakdown: {
      baseFarmingCost: Math.round(baseCost),
      fertilizer: additionalCosts.fertilizer || 0,
      labor:      additionalCosts.labor      || 0,
      irrigation: additionalCosts.irrigation || 0,
      other:      additionalCosts.other      || 0,
      existingExpenses,
    },
    marketPriceUsed: cropData.price,
    source: 'node-scoring-engine',
    disclaimer: 'Estimates based on average Indian agricultural data. Actual results depend on local conditions and market prices.',
  };
}
