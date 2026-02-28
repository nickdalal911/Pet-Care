const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getJwtSecret } = require("../config/jwt");

const JWT_SECRET = getJwtSecret();

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (!user.role) {
      user.role = "user";
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = auth;
