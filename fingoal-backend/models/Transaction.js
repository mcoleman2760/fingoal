import mongoose from "mongoose";

const txSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  merchant: { type: String, default: "" },
  category: { type: String, default: "Other" },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["income","expense","outcome"], default: "expense" }
}, { timestamps: true });

export default mongoose.model("Transaction", txSchema);
