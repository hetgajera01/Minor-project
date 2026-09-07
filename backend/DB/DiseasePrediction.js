import mongoose from "mongoose";

const diseasePredictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imagePath: { type: String, required: true },
  detectedCrop: { type: String },
  disease: { type: String },
  confidence: { type: Number },   // 0-100
  isHealthy: { type: Boolean, default: false },
  symptoms: [String],
  causes: [String],
  prevention: [String],
  treatment: [String],
  nextSteps: [String],
  disclaimer: { type: String, default: 'This is an AI-assisted prediction. Please consult a qualified agricultural expert before taking action.' },
  source: { type: String, default: 'ml-service' }, // ml-service | rule-based
}, { timestamps: true });

diseasePredictionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("DiseasePrediction", diseasePredictionSchema);
