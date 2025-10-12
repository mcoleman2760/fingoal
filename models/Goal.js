import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  timeline: { type: String, enum: ["1m","3m","6m","12m","24m","36m","custom"], default: "6m" },
  progress: { type: Number, default: 0 } // amount saved so far
}, { timestamps: true });

export default mongoose.model("Goal", goalSchema);
