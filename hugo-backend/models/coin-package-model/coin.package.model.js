/**
 * CoinPackage Schema
 * @typedef {Object} CoinPackage
 * @property {string} name - Unique name/identifier for the coin package
 * @property {number} coins - Number of coins included in the package (min: 1)
 * @property {number} price - Price of the package in the specified currency (min: 0)
 * @property {string} [currency="USD"] - Currency type for the package price (enum: "USD", "EUR", "INR", "GBP", "PKR")
 * @property {boolean} [isActive=true] - Activation status of the package
 * @property {Date} createdAt - Auto-generated creation timestamp
 * @property {Date} updatedAt - Auto-generated update timestamp
 *
 * @description Represents a coin package that users can purchase in the HUGO dating app.
 * Each package contains a specific number of virtual coins at a set price, allowing users
 * to buy coins in bundles for use within the application.
 */

const mongoose = require("mongoose");

const coinPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    coins: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "INR", "GBP", "PKR"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoinPackage", coinPackageSchema);
