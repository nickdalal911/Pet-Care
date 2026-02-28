const express = require("express");
const router = express.Router();
const { upload, normalizeUploadedImages } = require("../middleware/upload");
const usersController = require("../controllers/usersController");
const auth = require("../middleware/auth");

router.get("/me", auth, usersController.getCurrentUser);
router.put(
  "/me",
  auth,
  upload.single("avatar"),
  normalizeUploadedImages,
  usersController.updateCurrentUser
);

module.exports = router;
