import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { list, create } from "../controllers/transactionController.js";

const r = Router();
r.use(requireAuth);
r.get("/", list);
r.post("/", create);
export default r;
