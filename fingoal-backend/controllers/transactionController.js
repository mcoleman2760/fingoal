import Transaction from "../models/Transaction.js";

function normalize(raw, userId) {
  const amount = Number(raw.amount);
  const type = raw.type && ["income","expense"].includes(raw.type)
    ? raw.type
    : (Number.isFinite(amount) && amount < 0 ? "expense" : "income");
  return {
    user: userId,
    amount: Number.isFinite(amount) ? amount : 0,
    type,
    category: raw.category || "Uncategorized",
    description: raw.description || raw.merchant || raw.name || raw.memo || "",
    date: raw.date ? new Date(raw.date) : new Date(),
  };
}

// GET /api/transactions
export async function list(req, res) {
  const items = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
  res.json(items);
}

// GET /api/transactions/:id
export async function getOne(req, res) {
  const t = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
  if (!t) return res.status(404).json({ message: "Not found" });
  res.json(t);
}

// POST /api/transactions
export async function create(req, res) {
  try {
    const tx = await Transaction.create(normalize(req.body || {}, req.user.id));
    res.status(201).json(tx);
  } catch (e) {
    if (e?.name === "ValidationError") return res.status(400).json({ message: e.message });
    res.status(500).json({ message: "Failed to create transaction" });
  }
}

// PATCH /api/transactions/:id
export async function update(req, res) {
  const allowed = ["amount","type","category","description","date"];
  const patch = {};
  for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
  if ("amount" in patch) patch.type = patch.amount < 0 ? "expense" : "income";

  const t = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    patch,
    { new: true }
  );
  if (!t) return res.status(404).json({ message: "Not found" });
  res.json(t);
}

// DELETE /api/transactions/:id
export async function remove(req, res) {
  const r = await Transaction.deleteOne({ _id: req.params.id, user: req.user.id });
  if (!r.deletedCount) return res.status(404).json({ message: "Not found" });
  res.status(204).end();
}

// DELETE /api/transactions (danger: clear all)
export async function clearAll(req, res) {
  const r = await Transaction.deleteMany({ user: req.user.id });
  res.json({ deleted: r.deletedCount || 0 });
}