/**
 * Farm Digital Twin – Static Data (Stage 3)
 * ─────────────────────────────────────────────
 * FARM_ZONES below is used ONLY as a network-error fallback.
 * In normal operation, the farmer's saved FarmConfig is fetched
 * from /api/user/farm-config and processed by farmConfigUtils.layoutZones().
 *
 * VIEW_MODES and getZoneColor() are actively used by the 3D scene
 * for view-mode colour interpolation.
 */

// ── Fallback demo zones (used only when backend is unreachable) ─────────
export const FARM_ZONES = [
  {
    id: 'zone-1',
    name: 'Zone A',
    crop: 'Wheat',
    growthStage: 'Flowering',
    area: '2.4 acres',
    health: 85,
    soilMoisture: 62,
    diseaseRisk: 18,
    profitability: 74,
    waterUsage: 45,
    position: [-6, 0, -4],
    size: [5, 0.15, 4],
    cropType: 'wheat',
    color: '#d4a847',
  },
  {
    id: 'zone-2',
    name: 'Zone B',
    crop: 'Rice',
    growthStage: 'Vegetative',
    area: '1.8 acres',
    health: 72,
    soilMoisture: 80,
    diseaseRisk: 35,
    profitability: 58,
    waterUsage: 90,
    position: [2, 0, -4],
    size: [4, 0.15, 4],
    cropType: 'rice',
    color: '#7db87d',
  },
  {
    id: 'zone-3',
    name: 'Zone C',
    crop: 'Sugarcane',
    growthStage: 'Maturation',
    area: '3.1 acres',
    health: 91,
    soilMoisture: 55,
    diseaseRisk: 10,
    profitability: 88,
    waterUsage: 60,
    position: [-6, 0, 3],
    size: [5, 0.15, 4],
    cropType: 'sugarcane',
    color: '#8bc34a',
  },
  {
    id: 'zone-4',
    name: 'Zone D',
    crop: 'Cotton',
    growthStage: 'Boll Opening',
    area: '2.0 acres',
    health: 65,
    soilMoisture: 40,
    diseaseRisk: 52,
    profitability: 61,
    waterUsage: 30,
    position: [2, 0, 3],
    size: [4, 0.15, 4],
    cropType: 'cotton',
    color: '#f5f5dc',
  },
];

// ── View modes ─────────────────────────────────────────────────
export const VIEW_MODES = [
  { key: 'normal',        label: 'Normal',        icon: 'N', desc: 'Default view' },
  { key: 'cropHealth',    label: 'Crop Health',   icon: 'H', desc: 'Zone health (green = good)' },
  { key: 'water',         label: 'Water Mode',    icon: 'W', desc: 'Soil moisture levels' },
  { key: 'diseaseRisk',   label: 'Disease Risk',  icon: 'D', desc: 'Disease risk (red = high)' },
  { key: 'profitability', label: 'Profitability', icon: 'P', desc: 'Estimated profit score' },
];

// ── Helper: interpolate two hex colours ────────────────────────
function hexLerp(a, b, t) {
  const ah = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const bh = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const rh = Math.round(ah + (bh - ah) * t).toString(16).padStart(2, '0');
  const rg = Math.round(ag + (bg - ag) * t).toString(16).padStart(2, '0');
  const rb = Math.round(ab + (bb - ab) * t).toString(16).padStart(2, '0');
  return '#' + rh + rg + rb;
}

// ── Helper: get zone colour by view mode ───────────────────────
export function getZoneColor(zone, mode) {
  switch (mode) {
    case 'cropHealth':   return hexLerp('#dc2626', '#16a34a', zone.health / 100);
    case 'water':        return hexLerp('#fbbf24', '#2563eb', zone.soilMoisture / 100);
    case 'diseaseRisk':  return hexLerp('#16a34a', '#dc2626', zone.diseaseRisk / 100);
    case 'profitability':return hexLerp('#6b7280', '#d97706', zone.profitability / 100);
    default:             return zone.color;
  }
}
