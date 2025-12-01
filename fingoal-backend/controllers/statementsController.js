// controllers/statementsController.js
import Transaction from "../models/Transaction.js";

//  REPLACE ONLY THIS HANDLER
export const uploadStatement = async (req, res) => {
  try {
    // OPTION 1 (now): allow JSON rows for quick testing (e.g., Postman/curl)
    // [{ amount: 5900, type: "income", category: "Income", description: "Salary", date: "2025-10-01" }]
    const jsonRows = Array.isArray(req.body?.rows) ? req.body.rows : null;

    // OPTION 2 (later): when you add CSV/XLSX parsing, populate req.parsedRows = [...]
    const parsed = Array.isArray(req.parsedRows) ? req.parsedRows : null;

    const rows = jsonRows || parsed || [];

    // If no rows to insert, keep your previous “echo file info” behavior so uploads don’t break
    if (!rows.length) {
      if (!req.file && !req.files) {
        return res.status(400).json({ message: "No file uploaded or rows provided" });
      }
      return res.json({
        success: true,
        filename: req.file?.originalname || "(multiple files)",
        mimetype: req.file?.mimetype,
        size: req.file?.size,
        inserted: 0,
        note: "No parsed rows yet. Send JSON {rows:[...]} or implement CSV parsing.",
      });
    }

    // Normalize & persist rows for the CURRENT USER
    const docs = rows.map((r) => ({
      user: req.user.id, // 👈 critical so summaries/leaderboard can find your data
      amount: Number(r.amount),
      // Support either sign-based or explicit type-based pipelines
      type: r.type || (Number(r.amount) < 0 ? "expense" : "income"),
      category: r.category || "Uncategorized",
      description: r.description || r.memo || r.name || "",
      date: r.date ? new Date(r.date) : new Date(),
    }));

    if (docs.length) await Transaction.insertMany(docs);
    return res.json({ inserted: docs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload statement" });
  }
};


// Get all transactions to calculate income/outcome totals
export const getStatementsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const txs = await Transaction.find({ user: userId });

    const totalIncome = txs
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutcome = txs
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    res.json({
      income: totalIncome,
      outcome: totalOutcome,
      savingRate:
        totalIncome > 0 ? Math.round(((totalIncome - totalOutcome) / totalIncome) * 100) : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load statements summary" });
  }
};
