// import "dotenv/config";
// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import { connectDB } from "./config/db.js";

// import authRoutes from "./routes/auth.routes.js";
// import txRoutes from "./routes/transaction.routes.js";
// import goalsRoutes from "./routes/goals.routes.js";
// import statementsRoutes from "./routes/statements.routes.js";
// import friendRoutes from "./routes/friendRoutes.js"; // ESM import, note .js
// import sharedGoalsRoutes from "./routes/sharedGoals.routes.js"; // <-- new import

// // ✅ create app BEFORE using it
// const app = express();

// // middleware
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

// // routes
// app.get("/api/hello", (_req, res) =>
//   res.json({ message: "Hello from FinGoal API 👋" })
// );
// app.use("/api/auth", authRoutes);
// app.use("/api/transactions", txRoutes);
// app.use("/api/goals", goalsRoutes);
// app.use("/api/statements", statementsRoutes);
// app.use("/api/friends", friendRoutes);
// app.use("/api/shared-goals", sharedGoalsRoutes);
//  // <-- mount shared goals routes

// const port = process.env.PORT || 5001;

// connectDB().then(() => {
//   app.listen(port, () =>
//     console.log(`🚀 Server running on http://localhost:${port}`)
//   );
// });


import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import txRoutes from "./routes/transaction.routes.js";
import goalsRoutes from "./routes/goals.routes.js";
import statementsRoutes from "./routes/statements.routes.js";
import friendRoutes from "./routes/friendRoutes.js";
import sharedGoalsRoutes from "./routes/sharedGoals.routes.js";

const app = express();

// CORS: allow localhost + deployed frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://fingoal.vercel.app", // ✅ real Vercel URL
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // for Postman, curl, etc.
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(morgan("dev"));

// routes
app.get("/api/hello", (_req, res) =>
  res.json({ message: "Hello from FinGoal API 👋" })
);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", txRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/statements", statementsRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/shared-goals", sharedGoalsRoutes);

const port = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
});
