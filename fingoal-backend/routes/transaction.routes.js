// fingoal-backend/routes/transaction.routes.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import { list, create, clearAllTransactions } from "../controllers/transactionController.js";

const router = Router();

// List my transactions
router.get("/", auth, list);

// Create one transaction
router.post("/", auth, create);

// Reset all my transactions
router.delete("/", auth, clearAllTransactions);

export default router;
