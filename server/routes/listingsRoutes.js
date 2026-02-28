const express = require("express");
const router = express.Router();
const { upload, normalizeUploadedImages } = require("../middleware/upload");
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const listingsController = require("../controllers/listingsController");

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

module.exports = router;
