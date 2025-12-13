import mongoose from "mongoose";

const sharedGoalSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    members: [{ type: String, required: true }], // usernames only
  },
  { timestamps: true }
);

export default mongoose.model("SharedGoal", sharedGoalSchema);
