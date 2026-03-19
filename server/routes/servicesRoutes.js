const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { upload, normalizeUploadedImages } = require("../middleware/upload");
const servicesController = require("../controllers/servicesController");

router.get("/", servicesController.getServices);
router.get("/:id", servicesController.getServiceById);
router.post(
  "/",
  auth,
  authorize("provider"),
  upload.single("image"),
  normalizeUploadedImages,
  servicesController.createService
);
router.put(
  "/:id",
  auth,
  authorize("provider"),
  upload.single("image"),
  normalizeUploadedImages,
  servicesController.updateService
);
router.delete(
  "/:id",
  auth,
  authorize("provider"),
  servicesController.deleteService
);

module.exports = router;
