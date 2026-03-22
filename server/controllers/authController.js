import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getJwtSecret } from "../config/jwt.js";

const JWT_SECRET = getJwtSecret();
const ALLOWED_ROLES = ["user", "provider"];

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

const normalizeUser = (user) => {
  if (!user) return null;

  if (typeof user.toSafeObject === "function") {
    return user.toSafeObject();
  }

  const obj = user.toObject({ versionKey: false });
  delete obj.passwordHash;

  if (!obj.role) {
    obj.role = ALLOWED_ROLES[0];
  }

  return obj;
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, licenseNumber } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Choose user or provider.",
      });
    }

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: role || ALLOWED_ROLES[0],
      licenseNumber:
        role === "provider" ? licenseNumber?.trim() || "" : "",
    });

    const token = createToken(user._id);

    res.status(201).json({
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to sign up",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isValid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!isValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = createToken(user._id);

    res.json({
      token,
      user: normalizeUser(user),
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to log in",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  res.json(normalizeUser(req.user));
};