import mongoose from "mongoose";

/**
 * FarmConfig — one document per farmer.
 * Stores the farmer's entire farm layout for the Digital Twin.
 * Stage 3: Dynamic Farm Configuration
 */

const zoneSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  area:        { type: Number, required: true, min: 0.01 },  // acres
  crop:        { type: String, required: true, trim: true },
  cropVariety: { type: String, default: '' },
  growthStage: { type: String, default: '' },
  // Derived fields (computed on save, stored for quick 3D rendering)
  cropType:    { type: String, default: 'generic' },
  color:       { type: String, default: '#7db87d' },
}, { _id: true });

const farmConfigSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalArea: { type: Number, required: true, min: 0.1 }, // acres
  zones:     { type: [zoneSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("FarmConfig", farmConfigSchema);
