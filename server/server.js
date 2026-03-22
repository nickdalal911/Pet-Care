import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import connectDB from "./config/db.js";

import postsRoutes from "./routes/postsRoutes.js";
import listingsRoutes from "./routes/listingsRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Fix __dirname (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ FIX 1: Better CORS (works for dev + deployment)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get("/check-server", (_req, res) => {
  res.send("SERVER V2 RUNNING");
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/posts", postsRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Debug route
app.get("/debug-chat", (_req, res) => {
  res.send("CHAT ROUTE DEBUG ACTIVE");
});

// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ FIX 2: Add logs + proper DB connection
const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected ✅");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("MongoDB connection error ❌", error);
    process.exit(1);
  }
};

startServer();