// // fingoal-backend/routes/transaction.routes.js
// import { Router } from "express";
// import auth from "../middleware/auth.js";
// import { list, create } from "../controllers/transactionController.js";

// const router = Router();

// router.get("/", auth, list);
// router.post("/", auth, create);

// export default router;

// fingoal-backend/routes/transaction.routes.js
// transaction.routes.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import Transaction from "../models/Transaction.js";
import {
  list,
  create,
  clearAllTransactions,
} from "../controllers/transactionController.js";
import { parsePDFTransactions } from "../utils/pdfParser.js"; // use your parser

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Regular transaction routes
router.get("/", auth, list);
router.post("/", auth, create);

// Upload PDF route
router.post("/upload-pdf", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const transactions = await parsePDFTransactions(req.file.buffer);

    if (!transactions.length)
      return res.status(400).json({ error: "PDF format not recognized or no transactions found" });

    // Save each transaction to the database
    for (const tx of transactions) {
      await Transaction.create({
        userId: req.user.id,
        date: tx.date,
        category: tx.category,
        amount: tx.amount,
        description: tx.description,
      });
    }

    res.json({ imported: transactions.length, message: `Imported ${transactions.length} transactions from PDF.` });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

// Reset all transactions for this user
router.delete("/", auth, clearAllTransactions);

export default router;
