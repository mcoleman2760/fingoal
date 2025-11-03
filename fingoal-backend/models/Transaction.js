import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount:{ type: Number, required: true }, // positive=income, negative=expense (we also persist "type")
  type:  { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, default: "Uncategorized", index: true },
  description: { type: String, default: "" },
  date: { type: Date, required: true, index: true },
}, { timestamps: true });

TransactionSchema.index({ user: 1, date: -1 });
export default mongoose.model("Transaction", TransactionSchema);