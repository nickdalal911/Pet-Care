import express from "express";
const router = express.Router();

import { upload, normalizeUploadedImages } from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import * as listingsController from "../controllers/listingsController.js";

router.get("/", listingsController.getListings);

router.get("/:id", listingsController.getListingById);

router.post(
  "/",
  auth,
  authorize("provider"),
  upload.array("photos", 5),
  normalizeUploadedImages,
  listingsController.createListing
);

router.put(
  "/:id",
  auth,
  authorize("provider"),
  upload.array("photos", 5),
  normalizeUploadedImages,
  listingsController.updateListing
);

router.delete(
  "/:id",
  auth,
  authorize("provider"),
  listingsController.deleteListing
);

export default router;