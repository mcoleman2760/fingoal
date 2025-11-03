import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

// routes
import authRoutes from "./routes/auth.routes.js";
import txRoutes from "./routes/transaction.routes.js";
import goalRoutes from "./routes/goals.routes.js";
import stmtRoutes from "./routes/statements.routes.js";
// import friendRoutes from "./routes/friendRoutes.js" // optional if you kept it

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/api/hello", (_req, res) => res.json({ message: "FinGoal API up" }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/statements", stmtRoutes);
// app.use("/api/friends", friendRoutes);

const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});