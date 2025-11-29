// fingoal-backend/routes/transaction.routes.js
import { Router } from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import { list, create, clearAllTransactions, uploadPDF } from "../controllers/transactionController.js";

const router = Router();
const upload = multer();

router.get("/", auth, list);
router.post("/", auth, create);
router.delete("/", auth, clearAllTransactions);

router.post("/upload-pdf", auth, upload.single("file"), uploadPDF);

export default router;