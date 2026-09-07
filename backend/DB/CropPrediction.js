import mongoose from "mongoose";

const cropPredictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  cropName: { type: String, required: true },
  inputs: {
    N: Number, P: Number, K: Number,
    ph: Number, temperature: Number,
    humidity: Number, rainfall: Number,
    location: String, season: String,
  },
  result: {
    score: Number,        // suitability % 
    confidence: String,   // High / Medium / Low
    description: String,
    yieldEst: Number,     // tons per hectare
    landArea: Number,     // hectares used for calc
    costEst: Number,      // ₹
    revenueEst: Number,   // ₹
    profitEst: Number,    // ₹
    alternatives: [{ crop: String, score: Number, description: String }],
  },
  // Actual outcome (filled later by farmer)
  actual: {
    yieldTons: Number,
    revenueActual: Number,
    expenseActual: Number,
    profitActual: Number,
    recordedAt: Date,
  },
  status: { type: String, enum: ['predicted', 'in-progress', 'harvested'], default: 'predicted' },
}, { timestamps: true });

cropPredictionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("CropPrediction", cropPredictionSchema);
