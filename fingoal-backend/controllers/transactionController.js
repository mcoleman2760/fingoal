import { parsePDFTransactions } from "../utils/pdfParser.js";
import Transaction from "../models/Transaction.js";

export const uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No PDF file uploaded" });
    }

    const buffer = req.file.buffer;

    const parsed = await parsePDFTransactions(buffer);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(200).json({
        imported: 0,
        skipped: 1,
        message: "No valid transactions found in PDF",
      });
    }

    const userId = req.user?.id;

    const docs = parsed.map(tx => ({
      ...tx,
      user: userId,
    }));

    await Transaction.insertMany(docs);

    res.json({
      imported: docs.length,
      skipped: 0,
      message: `Imported ${docs.length} transactions`,
    });
  } catch (err) {
    console.error("❌ PDF upload error:", err);
    res.status(500).json({ message: "PDF import failed", error: err.message });
  }
};

/**
 * Utility: coerce and normalize a transaction payload before insert.
 * - Infers type from amount sign if not provided
 * - Ensures description exists (fallbacks to merchant/name/memo)
 * - Parses date safely
 */
function normalizeIncomingTx(raw, userId) {
  const amountNum = Number(raw.amount);
  const hasAmount = Number.isFinite(amountNum);

  const desc =
    raw.description ??
    raw.merchant ??
    raw.name ??
    raw.memo ??
    "";

  // prefer explicit type; otherwise infer from sign
  const t =
    raw.type && (raw.type === "income" || raw.type === "expense")
      ? raw.type
      : hasAmount && amountNum < 0
      ? "expense"
      : "income";

  // if caller passes positive expense or negative income, keep the amount as-is
  // (your UI/summary logic already handles sign + type)
  // Required fields are validated by the Mongoose schema.

  return {
    user: userId,
    amount: hasAmount ? amountNum : 0,
    type: t,
    category: raw.category || "Uncategorized",
    description: String(desc),
    date: raw.date ? new Date(raw.date) : new Date(),
  };
}

/**
 * GET /api/transactions
 * List transactions for the logged-in user (newest first).
 */
export async function list(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await Transaction.find({ user: userId }).sort({ date: -1 });

    // Ensure frontend always gets a `description` field
    const payload = items.map((doc) => {
      const obj = doc.toObject({ getters: true });
      return {
        ...obj,
        description: obj.description || obj.merchant || "",
      };
    });

    res.json(payload);
  } catch (err) {
    console.error("transactions.list error:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
}

/**
 * POST /api/transactions
 * Create a single transaction for the logged-in user.
 * Body: { amount, type?, category?, description?, date? }
 */
export async function create(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const normalized = normalizeIncomingTx(req.body || {}, userId);
    const tx = await Transaction.create(normalized);
    res.status(201).json(tx);
  } catch (err) {
    console.error("transactions.create error:", err);
    // surface validation errors clearly
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to create transaction" });
  }
}

/**
 * DELETE /api/transactions
 * Remove ALL transactions for the logged-in user (dangerous).
 * Returns: { deleted: <number> }
 */
export async function clearAllTransactions(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await Transaction.deleteMany({ user: userId });
    res.json({ deleted: result?.deletedCount ?? 0 });
  } catch (err) {
    console.error("transactions.clearAllTransactions error:", err);
    res.status(500).json({ message: "Failed to clear transactions" });
  }
}
