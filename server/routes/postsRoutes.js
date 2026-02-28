const express = require("express");
const router = express.Router();
const { upload, normalizeUploadedImages } = require("../middleware/upload");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const postsController = require("../controllers/postsController");

router.get("/", postsController.getPosts);
router.get(
  "/mine",
  auth,
  authorize("user", "provider"),
  postsController.getMyPosts
);
router.get("/:id", postsController.getPostById);
router.post(
  "/",
  auth,
  authorize("user", "provider"),
  upload.single("image"),
  normalizeUploadedImages,
  postsController.createPost
);
router.put(
  "/:id",
  auth,
  authorize("user", "provider"),
  upload.single("image"),
  normalizeUploadedImages,
  postsController.updatePost
);
router.delete(
  "/:id",
  auth,
  authorize("user", "provider"),
  postsController.deletePost
);

module.exports = router;
