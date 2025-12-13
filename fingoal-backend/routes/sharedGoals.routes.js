import { Router } from "express";
import auth from "../middleware/auth.js"; // your JWT auth middleware
import {
  listSharedGoals,
  createSharedGoal,
  updateSharedGoal,
  deleteSharedGoal,
} from "../controllers/sharedGoalController.js";

const router = Router();

// Protect all routes so req.user is available
router.use(auth);

router.get("/", listSharedGoals); // GET /api/shared-goals
router.post("/", createSharedGoal); // POST /api/shared-goals
router.put("/:id", updateSharedGoal);
router.delete("/:id", deleteSharedGoal); // DELETE /api/shared-goals/:id

export default router;
