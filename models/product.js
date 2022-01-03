const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please give a name"],
    trim: true,
    maxlength: [150, "Product name should be of length 150 or less"],
  },
  price: {
    type: Number,
    required: [true, "Give a price for the product"],
  },
  description: {
    type: String,
    required: [true, "Please provide a product description"],
    trim: true,
  },
  photos: [
    {
      id: String,
      secure_url: String,
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please select a category: shortSleeves, longSleeves, sweatShirts, hoodies",
    ],
    enum: {
      values: ["shortSleeves", "longSleeves", "sweatShirts", "hoodies"],
      message:
        "Please select a category only from: shortSleeves, longSleeves, sweatShirts, hoodies",
    },
  },
  brand: {
    type: String,
    required: [true, "Please add a brand for product"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
      },
    },
  ],
  stock: {
    type: Number,
    required: [true, "Please mention the stock quantity"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
