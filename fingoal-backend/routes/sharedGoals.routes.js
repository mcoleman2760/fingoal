import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  listSharedGoals,
  createSharedGoal,
  updateSharedGoal,
  deleteSharedGoal,
} from "../controllers/sharedGoalController.js";

const router = Router();

router.get("/", auth, listSharedGoals);
router.post("/", auth, createSharedGoal);
router.put("/", auth, updateSharedGoal);
router.delete("/shared-goals/:id", deleteSharedGoal);


export default router;
