const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, category, description, affiliateLink } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const product = await Product.create({
      title,
      category,
      description,
      affiliateLink,
      image: `/uploads/${req.file.filename}`,
    });

    res.status(201).json(product);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create product", error: error.message });
  }
};

exports.redirectToAffiliate = async (req, res) => {
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
      return res
        .status(400)
        .json({ message: "Affiliate link is missing for this product" });
    }

    return res.redirect(product.affiliateLink);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to process redirect", error: error.message });
  }
};
