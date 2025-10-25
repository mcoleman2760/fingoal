// fingoal-backend/routes/goals.routes.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import { list, create } from "../controllers/goalController.js";

const router = Router();

router.get("/", auth, list);
router.post("/", auth, create);

export default router;
