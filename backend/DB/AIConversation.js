import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const aiConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: String, required: true },
  messages: [messageSchema],
  context: {
    crop: { type: String },
    location: { type: String },
    season: { type: String },
  },
}, { timestamps: true });

aiConversationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("AIConversation", aiConversationSchema);
