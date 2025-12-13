// // fingoal-backend/routes/statements.routes.js
// import { Router } from "express";
// import multer from "multer";
// import auth from "../middleware/auth.js";
// import { uploadStatement, getStatementsSummary } from "../controllers/statementsController.js";
// import { parse } from "csv-parse/sync";

// const router = Router();

// // Multer: keep in memory
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
//   fileFilter: (_req, file, cb) => {
//     const ok =
//       file.mimetype === "text/csv" ||
//       file.mimetype === "application/pdf" ||
//       file.mimetype === "application/vnd.ms-excel" ||
//       file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
//     // accept = true / reject = false
//     cb(null, ok);
//   },
// });

// // 🔒 everything below requires JWT
// router.use(auth);

// // Health check (optional)
// router.get("/ping", (_req, res) => res.json({ ok: true, where: "statements" }));

// // CSV parsing middleware (runs only if a file exists and is CSV)
// function parseCsvIfPresent(req, res, next) {
//   try {
//     if (!req.file) return next();

//     const isCsv =
//       req.file.mimetype === "text/csv" ||
//       (req.file.originalname || "").toLowerCase().endsWith(".csv");

//     if (!isCsv) return next();

//     const text = req.file.buffer.toString("utf8");
//     const records = parse(text, { columns: true, skip_empty_lines: true });

//     // Map common bank headers → normalized fields your controller expects
//     req.parsedRows = records.map((r) => ({
//       amount:
//         r.amount ??
//         r.Amount ??
//         r.AMOUNT ??
//         r.TRANSACTION_AMOUNT ??
//         r["Transaction Amount"],
//       type: r.type ?? r.Type ?? r.TYPE, // optional; controller infers from sign
//       category:
//         r.category ??
//         r.Category ??
//         r.CATEGORY ??
//         r.MerchantCategory ??
//         r["Category Name"],
//       description:
//         r.description ??
//         r.Description ??
//         r.DESCRIPTION ??
//         r.Merchant ??
//         r["Transaction Description"] ??
//         r["Description"],
//       date:
//         r.date ??
//         r.Date ??
//         r.POSTED_DATE ??
//         r["Transaction Date"] ??
//         r["Posted Date"],
//     }));

//     // Optional debug:
//     // console.log("parsedRows:", req.parsedRows.length, req.parsedRows[0]);

//     next();
//   } catch (err) {
//     console.error("Upload parse error:", err);
//     res.status(500).json({ message: "Upload failed" });
//   }
// }

// // ✅ Single, authenticated upload route
// router.post("/upload", upload.single("file"), parseCsvIfPresent, uploadStatement);

// // ✅ Summary used by fetchMySavingRate()
// router.get("/", getStatementsSummary);

// export default router;

// fingoal-backend/routes/statements.routes.js
import { Router } from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import {
  uploadStatement,
  getStatementsSummary,
} from "../controllers/statementsController.js";
import { parse } from "csv-parse/sync";

const router = Router();

/**
 * Helpers
 */
function getFileMeta(file) {
  const original = (file?.originalname || "").toLowerCase();
  const mimetype = (file?.mimetype || "").toLowerCase();
  const isCsv =
    mimetype === "text/csv" ||
    mimetype === "application/vnd.ms-excel" ||
    original.endsWith(".csv");

  const isPdf = mimetype === "application/pdf" || original.endsWith(".pdf");

  // Optional: keep these if you plan to support xlsx later
  const isXlsx =
    mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    original.endsWith(".xlsx");

  return { original, mimetype, isCsv, isPdf, isXlsx };
}

// Multer: keep in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    // IMPORTANT: don’t rely only on mimetype (varies in production)
    const { isCsv, isPdf, isXlsx } = getFileMeta(file);
    const ok = isCsv || isPdf || isXlsx;
    cb(null, ok); // accept = true / reject = false
  },
});

// 🔒 everything below requires JWT
router.use(auth);

// Health check (optional)
router.get("/ping", (_req, res) => res.json({ ok: true, where: "statements" }));

/**
 * CSV parsing middleware:
 * - If CSV: parse and attach req.parsedRows
 * - If PDF: do NOT parse here (controller should handle PDF), just tag req.fileKind
 * - Otherwise: pass through (controller can respond accordingly)
 */
function parseCsvIfPresent(req, res, next) {
  try {
    if (!req.file) return next();

    const { isCsv, isPdf } = getFileMeta(req.file);

    // Tag the file kind so the controller can make decisions consistently
    req.fileKind = isCsv ? "csv" : isPdf ? "pdf" : "unknown";

    if (!isCsv) return next();

    const text = req.file.buffer.toString("utf8");
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Map common bank headers → normalized fields your controller expects
    req.parsedRows = records.map((r) => ({
      amount:
        r.amount ??
        r.Amount ??
        r.AMOUNT ??
        r.TRANSACTION_AMOUNT ??
        r["Transaction Amount"],
      type: r.type ?? r.Type ?? r.TYPE, // optional; controller can infer from sign
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

    return next();
  } catch (err) {
    console.error("Upload parse error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
}

// ✅ Single, authenticated upload route
router.post("/upload", upload.single("file"), parseCsvIfPresent, uploadStatement);

// ✅ Summary used by fetchMySavingRate()
router.get("/", getStatementsSummary);

export default router;
