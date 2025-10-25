// fingoal-backend/routes/statements.routes.js
import { Router } from "express";
import multer from "multer";
// If uploads should be protected, uncomment the next line and add `auth` to the route.
// import auth from "../middleware/auth.js";

const router = Router();

// Multer config: keep in memory (you can switch to disk if you want)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    // allow common statement types (tweak as needed)
    const ok =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.ms-excel" || // some browsers label CSV as excel
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // xlsx
    cb(null, ok);
  },
});

// POST /api/statements/upload
// If you want auth: `router.post("/upload", auth, upload.single("file"), handler)`
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded (use field name 'file')." });
    }

    // Access the uploaded file:
    // - req.file.buffer (Buffer) → file bytes (CSV/PDF/XLSX)
    // - req.file.originalname → filename
    // - req.file.mimetype → mime type
    // - req.file.size → size in bytes

    // TODO: parse file if you need to (CSV/XLSX/PDF). For now just echo info.
    return res.json({
      success: true,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
