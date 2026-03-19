const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { upload, normalizeUploadedImages } = require("../middleware/upload");
const productsController = require("../controllers/productsController");

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

module.exports = router;
