import express from "express";
const router = express.Router();

import { upload, normalizeUploadedImages } from "../middleware/upload.js";
import * as usersController from "../controllers/usersController.js";
import auth from "../middleware/auth.js";

router.get("/me", auth, usersController.getCurrentUser);

router.put(
  "/me",
  auth,
  upload.single("avatar"),
  normalizeUploadedImages,
  usersController.updateCurrentUser
);

export default router;