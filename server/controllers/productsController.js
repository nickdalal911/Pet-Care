import Product from "../models/Product.js";

const AMAZON_DISCLOSURE =
  "This website participates in the Amazon Associates Program and earns from qualifying purchases.";

export const getAffiliateDisclosure = async (_req, res) => {
  res.json({ description: AMAZON_DISCLOSURE });
};

export const getProducts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { price, category, description, affiliateLink } = req.body;
    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ message: "A valid product price is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Product image is required" });
    }

    const product = await Product.create({
      price: parsedPrice,
      category,
      description,
      affiliateLink,
      image: `/uploads/${req.file.filename}`,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

export const redirectToAffiliate = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.affiliateLink) {
      return res.status(400).json({
        message: "Affiliate link is missing for this product",
      });
    }

    return res.redirect(product.affiliateLink);
  } catch (error) {
    res.status(500).json({
      message: "Failed to process redirect",
      error: error.message,
    });
  }
};