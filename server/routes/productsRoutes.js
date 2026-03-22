import express from "express";
const router = express.Router();

import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import { upload, normalizeUploadedImages } from "../middleware/upload.js";
import * as productsController from "../controllers/productsController.js";

router.get("/disclosure", productsController.getAffiliateDisclosure);

router.get("/", productsController.getProducts);

router.post(
  "/",
  auth,
  authorize("provider"),
  upload.single("image"),
  normalizeUploadedImages,
  productsController.createProduct
);

router.get("/redirect/:id", productsController.redirectToAffiliate);

export default router;