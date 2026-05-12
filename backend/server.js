import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import { seedDefaultTemplates } from "./controllers/templateController.js";

dotenv.config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://client-portal-taupe-nu.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"]
}));
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api", documentRoutes);
app.use("/api/templates", templateRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedDefaultTemplates();
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
