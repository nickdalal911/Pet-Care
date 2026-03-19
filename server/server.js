require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const postsRoutes = require("./routes/postsRoutes");
const listingsRoutes = require("./routes/listingsRoutes");
const productsRoutes = require("./routes/productsRoutes");
const servicesRoutes = require("./routes/servicesRoutes");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chat");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.get("/test", (req, res) => {
//   res.send("TEST WORKING");
// });
// app.use(cors());
app.use(cors({
  origin: "https://petcare16.netlify.app",
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ✅ ROUTES (keep these BEFORE 404)
app.use("/api/posts", postsRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// ❗️IMPORTANT: 404 should be LAST
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// DB + Server start
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database", error);
    process.exit(1);
  });