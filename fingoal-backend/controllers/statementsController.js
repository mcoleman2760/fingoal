import Transaction from "../models/Transaction.js";

export const uploadStatement = async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
    if (!rows.length) {
      return res.status(400).json({ message: "Send JSON {rows:[...]} for now" });
    }

    const docs = rows.map((r) => ({
      user: req.user.id,
      amount: Number(r.amount),
      type: r.type || (Number(r.amount) < 0 ? "expense" : "income"),
      category: r.category || "Uncategorized",
      description: r.description || r.memo || r.name || "",
      date: r.date ? new Date(r.date) : new Date(),
    }));

    if (docs.length) await Transaction.insertMany(docs);
    res.json({ inserted: docs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload statement" });
  }
};

export const getStatementsSummary = async (req, res) => {
  const txs = await Transaction.find({ user: req.user.id });
  const income = txs.filter(t => t.amount > 0).reduce((s,t)=>s+t.amount,0);
  const outcome = txs.filter(t => t.amount < 0).reduce((s,t)=>s+Math.abs(t.amount),0);
  res.json({
    income,
    outcome,
    savingRate: income > 0 ? Math.round(((income - outcome) / income) * 100) : 0,
  });
};