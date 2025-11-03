import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 1 },
  timeline: { type: String, default: "" },     // e.g., "6m", "Dec 2025"
  progress: { type: Number, default: 0, min: 0 }, // you can update via PATCH
}, { timestamps: true });

GoalSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Goal", GoalSchema);