import Transaction from "../models/Transaction.js";

export async function list(req, res) {
  const items = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(items);
}

export async function create(req, res) {
  const { merchant, category, amount, date, type } = req.body;
  if (amount == null) return res.status(400).json({ error: "amount required" });
  const tx = await Transaction.create({ userId: req.user.id, merchant, category, amount, date, type });
  res.status(201).json(tx);
}
