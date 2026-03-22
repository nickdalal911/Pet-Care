import express from "express";
const router = express.Router();

import { upload, normalizeUploadedImages } from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import * as postsController from "../controllers/postsController.js";

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

router.post("/:id/like", auth, async (req, res) => {
  console.log("LIKE ROUTE HIT");

  try {
    const post = await postsController.likePost(req.params.id, req.user.id);
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error liking post" });
  }
});

router.post("/:id/comment", auth, async (req, res) => {
  console.log("COMMENT ROUTE HIT");

  try {
    const post = await postsController.commentOnPost(
      req.params.id,
      req.user.id,
      req.body.text
    );

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error commenting" });
  }
});

export default router;