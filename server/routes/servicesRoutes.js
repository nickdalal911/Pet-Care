import express from "express";
const router = express.Router();

import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import { upload, normalizeUploadedImages } from "../middleware/upload.js";
import * as servicesController from "../controllers/servicesController.js";

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

export default router;