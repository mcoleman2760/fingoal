import mongoose from "mongoose";

const sharedGoalSchema = new mongoose.Schema(
  {
    // creator of the goal
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // both users who share this goal (owner + friend)
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],

    // goal info
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    timeline: {
      type: String,
      enum: ["1m", "3m", "6m", "12m", "24m", "36m", "custom"],
      default: "6m",
    },
    progress: { type: Number, default: 0 }, // total saved between both users

    // optional per‑user contribution tracking
    contributions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("SharedGoal", sharedGoalSchema);
