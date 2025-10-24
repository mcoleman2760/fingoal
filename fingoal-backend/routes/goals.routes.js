// For this week's task, serve mock goals without auth.
// Swap to DB + auth later by adding requireAuth and Goal model ops.
import { Router } from "express";
import { listMock } from "../controllers/goalController.js";
const r = Router();
r.get("/", listMock);
export default r;
