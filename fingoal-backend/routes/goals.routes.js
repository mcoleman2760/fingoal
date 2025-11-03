import { Router } from "express";
import auth from "../middleware/auth.js";
import { list, create, update, remove } from "../controllers/goalController.js";

const r = Router();
r.use(auth);
r.get("/", list);
r.post("/", create);
r.patch("/:id", update);
r.delete("/:id", remove);
export default r;