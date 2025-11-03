import { Router } from "express";
import auth from "../middleware/auth.js";
import { list, getOne, create, update, remove, clearAll } from "../controllers/transactionController.js";

const r = Router();
r.use(auth);
r.get("/", list);
r.get("/:id", getOne);
r.post("/", create);
r.patch("/:id", update);
r.delete("/:id", remove);
r.delete("/", clearAll); // danger
export default r;