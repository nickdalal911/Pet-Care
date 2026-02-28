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

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/posts", postsRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = status === 400 ? err.message : "Server error";
  console.error(err);
  res.status(status).json({ message, error: err.cause?.message || err.message });
});

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
