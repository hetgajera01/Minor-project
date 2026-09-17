/**
 * farmConfigUtils.js — Stage 3
 * Pure utility functions for Dynamic Farm Configuration.
 * No React imports — safe to use anywhere.
 */

// ── Crop metadata map ───────────────────────────────────────────────────
export const CROP_OPTIONS = [
  'Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Soybean',
  'Tomato', 'Groundnut', 'Potato', 'Onion', 'Chickpea', 'Mustard', 'Other',
];

const CROP_META = {
  wheat:     { cropType: 'wheat',     color: '#d4a847' },
  rice:      { cropType: 'rice',      color: '#7db87d' },
  sugarcane: { cropType: 'sugarcane', color: '#8bc34a' },
  cotton:    { cropType: 'cotton',    color: '#f5f5dc' },
  maize:     { cropType: 'maize',     color: '#f59e0b' },
  soybean:   { cropType: 'soybean',   color: '#a3e635' },
  tomato:    { cropType: 'tomato',    color: '#ef4444' },
  groundnut: { cropType: 'groundnut', color: '#ca8a04' },
  potato:    { cropType: 'potato',    color: '#a78bfa' },
  onion:     { cropType: 'onion',     color: '#c084fc' },
  chickpea:  { cropType: 'chickpea',  color: '#fbbf24' },
  mustard:   { cropType: 'mustard',   color: '#facc15' },
  other:     { cropType: 'generic',   color: '#6ab04c' },
};

export function deriveCropMeta(cropName) {
  const key = (cropName || '').toLowerCase().trim().replace(/\s+/g, '');
  return CROP_META[key] || CROP_META.other;
}

// ── Farm scale: map real acres to 3D world-space units ─────────────────
// Returns { farmW, farmD } — the half-width and half-depth of the farm in world units.
export function computeFarmWorldSize(totalArea) {
  // Chosen so that 10 acres ≈ 20×20 units, scaling proportionally.
  const scale = Math.sqrt(totalArea) * 2.8;
  const farmW = Math.max(scale, 8);
  const farmD = Math.max(scale * 0.75, 6);
  return { farmW, farmD };
}

// ── Layout algorithm ────────────────────────────────────────────────────
/**
 * Takes the farmer's zone array and totalArea, returns a new array where
 * each zone has been enriched with:
 *   position: [x, y, z]  — centre of the zone in world space
 *   size:     [w, h, d]  — box dimensions (height is always 0.15)
 *   id, cropType, color  — derived
 *
 * The farm is packed into a grid. Gaps of 0.8 units act as paths.
 */
export function layoutZones(zones, totalArea) {
  if (!zones || zones.length === 0) return [];

  const PATH = 0.8;           // gap between zones (becomes dirt paths)
  const ZONE_H = 0.15;        // zone slab height

  const { farmW, farmD } = computeFarmWorldSize(totalArea);
  const totalZoneArea = zones.reduce((s, z) => s + Number(z.area), 0);

  const n = zones.length;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);

  // Available space per cell
  const cellW = (farmW * 2 - PATH * (cols + 1)) / cols;
  const cellD = (farmD * 2 - PATH * (rows + 1)) / rows;

  return zones.map((zone, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);

    // Scale zone width/depth by its area share within the cell
    const areaShare = totalZoneArea > 0 ? Number(zone.area) / totalZoneArea : 1 / n;
    // Width scales with area, clamped to cellW; depth stays constant
    const zW = Math.min(Math.max(cellW * Math.sqrt(areaShare * n), cellW * 0.5), cellW);
    const zD = cellD;

    // Position: bottom-left corner of the farm is (-farmW, 0, -farmD)
    const startX = -farmW + PATH;
    const startZ = -farmD + PATH;

    const cx = startX + col * (cellW + PATH) + zW / 2;
    const cz = startZ + row * (cellD + PATH) + zD / 2;

    const { cropType, color } = deriveCropMeta(zone.crop);

    return {
      id:          zone._id || `zone-${idx}`,
      name:        zone.name,
      crop:        zone.crop,
      cropVariety: zone.cropVariety || '',
      growthStage: zone.growthStage || 'Growing',
      area:        `${Number(zone.area).toFixed(1)} acres`,
      // Demo health/moisture values for view modes (real data: Stage 4+)
      health:      70 + Math.round((idx * 7) % 25),
      soilMoisture:55 + Math.round((idx * 11) % 35),
      diseaseRisk: 10 + Math.round((idx * 13) % 40),
      profitability:60 + Math.round((idx * 9) % 35),
      waterUsage:  40 + Math.round((idx * 17) % 50),
      cropType:    zone.cropType || cropType,
      color:       zone.color   || color,
      position:    [cx, 0, cz],
      size:        [zW, ZONE_H, zD],
    };
  });
}

// ── Farm boundary dimensions ────────────────────────────────────────────
export function farmBoundaryProps(totalArea) {
  const { farmW, farmD } = computeFarmWorldSize(totalArea);
  return { farmW, farmD };
}

// ── Camera position recommendation ─────────────────────────────────────
export function recommendedCameraPos(totalArea) {
  const { farmW, farmD } = computeFarmWorldSize(totalArea);
  const dist = Math.max(farmW, farmD) * 1.6;
  return [0, dist * 0.9, dist];
}
