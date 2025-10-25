// fingoal-backend/routes/transaction.routes.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import { list, create } from "../controllers/transactionController.js";

const router = Router();

router.get("/", auth, list);
router.post("/", auth, create);

export default router;
