import { Router } from "express";
import auth from "../middleware/auth.js";
import { uploadStatement, getStatementsSummary } from "../controllers/statementsController.js";

const r = Router();
r.use(auth);
r.post("/upload", uploadStatement);   // JSON rows for now
r.get("/", getStatementsSummary);
export default r;