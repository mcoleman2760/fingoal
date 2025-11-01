// models/Transaction.js
import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const TxSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ← important
    amount: { type: Number, required: true }, // income > 0, expense < 0 is fine
    type: { type: String, enum: ["income", "expense"], required: false }, // optional, we still infer from sign
    category: { type: String, default: "Uncategorized" },
    description: { type: String, default: "" },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export default models.Transaction || model("Transaction", TxSchema);
