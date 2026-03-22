import User from "../models/User.js";

const normalizePath = (file) => (file ? `/uploads/${file.filename}` : "");

const toSafe = (user) =>
  user?.toSafeObject ? user.toSafeObject() : user;

export const getCurrentUser = async (req, res) => {
  res.json(toSafe(req.user));
};

export const updateCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatableFields = ["name", "bio", "location"];

    if (req.user.role === "provider") {
      if (typeof req.body.licenseNumber !== "undefined") {
        user.licenseNumber = req.body.licenseNumber.trim();
      }
    }

    updatableFields.forEach((field) => {
      if (typeof req.body[field] !== "undefined") {
        user[field] = req.body[field];
      }
    });

    if (req.file) {
      user.avatarUrl = normalizePath(req.file);
    }

    const updated = await user.save();

    res.json(toSafe(updated));
  } catch (error) {
    res.status(400).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};