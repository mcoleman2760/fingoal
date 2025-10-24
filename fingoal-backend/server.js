import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import txRoutes from "./routes/transaction.routes.js";
import goalsRoutes from "./routes/goals.routes.js";

dotenv.config();
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// sample hello
app.get("/api/hello", (_req, res) => res.json({ message: "Hello from FinGoal API 👋" }));

// feature routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/goals", goalsRoutes);

const port = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(port, () => console.log(`🚀 API listening on http://localhost:${port}`));
});
