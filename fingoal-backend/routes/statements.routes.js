// fingoal-backend/routes/statements.routes.js
import { Router } from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import { uploadStatement, getStatementsSummary } from "../controllers/statementsController.js";
import { parse } from "csv-parse/sync";

const router = Router();

// Multer: keep in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    // accept = true / reject = false
    cb(null, ok);
  },
});

// 🔒 everything below requires JWT
router.use(auth);

// Health check (optional)
router.get("/ping", (_req, res) => res.json({ ok: true, where: "statements" }));

// CSV parsing middleware (runs only if a file exists and is CSV)
function parseCsvIfPresent(req, res, next) {
  try {
    if (!req.file) return next();

    const isCsv =
      req.file.mimetype === "text/csv" ||
      (req.file.originalname || "").toLowerCase().endsWith(".csv");

    if (!isCsv) return next();

    const text = req.file.buffer.toString("utf8");
    const records = parse(text, { columns: true, skip_empty_lines: true });

    // Map common bank headers → normalized fields your controller expects
    req.parsedRows = records.map((r) => ({
      amount:
        r.amount ??
        r.Amount ??
        r.AMOUNT ??
        r.TRANSACTION_AMOUNT ??
        r["Transaction Amount"],
      type: r.type ?? r.Type ?? r.TYPE, // optional; controller infers from sign
      category:
        r.category ??
        r.Category ??
        r.CATEGORY ??
        r.MerchantCategory ??
        r["Category Name"],
      description:
        r.description ??
        r.Description ??
        r.DESCRIPTION ??
        r.Merchant ??
        r["Transaction Description"] ??
        r["Description"],
      date:
        r.date ??
        r.Date ??
        r.POSTED_DATE ??
        r["Transaction Date"] ??
        r["Posted Date"],
    }));

    // Optional debug:
    // console.log("parsedRows:", req.parsedRows.length, req.parsedRows[0]);

    next();
  } catch (err) {
    console.error("Upload parse error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
}

// ✅ Single, authenticated upload route
router.post("/upload", upload.single("file"), parseCsvIfPresent, uploadStatement);

// ✅ Summary used by fetchMySavingRate()
router.get("/", getStatementsSummary);

export default router;
