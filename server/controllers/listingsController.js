import Listing from "../models/Listing.js";

const filesToPaths = (files = []) =>
  files.map((file) => `/uploads/${file.filename}`);

export const getListings = async (_req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch listings",
      error: error.message,
    });
  }
};

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch listing",
      error: error.message,
    });
  }
};

export const createListing = async (req, res) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      photos: filesToPaths(req.files),
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create listing",
      error: error.message,
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    Object.assign(listing, req.body);

    if (req.files && req.files.length > 0) {
      listing.photos = filesToPaths(req.files);
    }

    const updated = await listing.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update listing",
      error: error.message,
    });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json({ message: "Listing deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete listing",
      error: error.message,
    });
  }
};