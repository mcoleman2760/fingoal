// // server.js (ESM)
// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// // import dotenv from "dotenv";
// import 'dotenv/config';

// import { connectDB } from "./config/db.js";
// import authRoutes from "./routes/auth.routes.js";
// import txRoutes from "./routes/transaction.routes.js";
// import goalsRoutes from "./routes/goals.routes.js";
// import statementsRoutes from "./routes/statements.routes.js";

// dotenv.config();

// // 1) create app FIRST
// const app = express();

// // 2) middleware
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(express.json());
// app.use(morgan("dev"));

// // 3) health / sample
// app.get("/api/hello", (_req, res) =>
//   res.json({ message: "Hello from FinGoal API 👋" })
// );

// // 4) routes
// app.use("/api/auth", authRoutes);
// app.use("/api/transactions", txRoutes);
// app.use("/api/goals", goalsRoutes);
// app.use("/api/statements", statementsRoutes); // <-- now after app is defined

// // 5) start after DB connects
// const port = process.env.PORT || 5001;
// connectDB().then(() => {
//   app.listen(port, () =>
//     console.log(`🚀 Server running on http://localhost:${port}`)
//   );
// });

import 'dotenv/config';         // <-- only this, at the very top
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import txRoutes from "./routes/transaction.routes.js";
import goalsRoutes from "./routes/goals.routes.js";
import statementsRoutes from "./routes/statements.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/hello", (_req, res) => res.json({ message: "Hello from FinGoal API 👋" }));

app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/statements", statementsRoutes);

const port = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
});
