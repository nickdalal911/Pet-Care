const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      default: "",
      trim: true,
    },
    breed: {
      type: String,
      default: "",
      trim: true,
    },
    age: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
