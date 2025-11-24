import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const sharedGoalSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    contributors: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        amount: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const SharedGoal = models.SharedGoal || model("SharedGoal", sharedGoalSchema);
export default SharedGoal;
