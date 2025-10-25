// import Transaction from "../models/Transaction.js";

// export async function list(req, res) {
//   const items = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
//   res.json(items);
// }

// export async function create(req, res) {
//   const { merchant, category, amount, date, type } = req.body;
//   if (amount == null) return res.status(400).json({ error: "amount required" });
//   const tx = await Transaction.create({ userId: req.user.id, merchant, category, amount, date, type });
//   res.status(201).json(tx);
// }

// fingoal-backend/controllers/transactionController.js
import Transaction from "../models/Transaction.js";

/**
 * GET /api/transactions
 * List transactions for the logged-in user.
 */
export async function list(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const items = await Transaction.find({ userId }).sort({ date: -1 });

    // Ensure frontend gets a `description` field (maps from merchant)
    const payload = items.map((doc) => {
      const obj = doc.toObject();
      return {
        ...obj,
        description: obj.description || obj.merchant || "", // keep both if your schema has description
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
 * Create a new transaction for the logged-in user.
 * Accepts either:
 *   - { description, category, amount, date, type }
 *   - { merchant, category, amount, date, type }
 */
export async function create(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // front-end sends { date, description, amount, type?, category? }
    const {
      merchant,
      description,
      category = "Uncategorized",
      amount,
      date,
      type,
    } = req.body;

    if (amount == null || isNaN(Number(amount))) {
      return res.status(400).json({ error: "amount required" });
    }

    const merchantOrDesc = merchant ?? description ?? "";
    const signedAmount = Number(amount);
    const inferredType = type || (signedAmount < 0 ? "outcome" : "income");

    const tx = await Transaction.create({
      userId,
      merchant: merchantOrDesc,    // stored as `merchant` in DB
      category,
      amount: signedAmount,        // signed number (neg = spending)
      date,                        // let your schema handle Date casting
      type: inferredType,          // optional if your schema stores it
    });

    // Ensure the client gets a `description` field
    const obj = tx.toObject();
    return res.status(201).json({
      ...obj,
      description: obj.description || obj.merchant || "",
    });
  } catch (err) {
    console.error("transactions.create error:", err);
    res.status(500).json({ message: "Failed to create transaction" });
  }
}

/**
 * DELETE /api/transactions
 * Delete ALL transactions for the logged-in user (reset to zero).
 */
export async function clearAllTransactions(req, res) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await Transaction.deleteMany({ userId });
    res.json({ deleted: result.deletedCount || 0 });
  } catch (err) {
    console.error("transactions.clearAll error:", err);
    res.status(500).json({ message: "Failed to clear transactions" });
  }
}
