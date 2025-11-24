import { Router } from "express";

import {
  getSharedGoals,
  createSharedGoal,
  contributeToSharedGoal,
} from "../controllers/sharedGoalController.js";
import  auth  from "../middleware/auth.js"; // make sure you have this

const router = Router();

router.get("/", auth, getSharedGoals);
router.post("/", auth, createSharedGoal);
router.put("/:goalId", auth, contributeToSharedGoal);

export default router;
