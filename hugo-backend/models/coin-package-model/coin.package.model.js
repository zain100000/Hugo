/**
 * CoinPackage Schema
 * @typedef {Object} CoinPackage
 * @property {string} name - Unique name/identifier for the coin package
 * @property {number} coins - Number of coins included in the package (min: 1)
 * @property {number} price - Price of the package in the specified currency (min: 0)
 * @property {string} [currency="USD"] - Currency type for the package price (enum: "USD", "EUR", "INR", "GBP", "PKR")
 * @property {Object} duration - Duration of the package
 * @property {number} duration.value - Numeric duration value (e.g., 1, 7, 30, 10, 25)
 * @property {string} duration.unit - Duration unit (enum: "day", "days", "week", "month")
 * @property {boolean} [isActive=true] - Activation status of the package
 * @property {Date} createdAt - Auto-generated creation timestamp
 * @property {Date} updatedAt - Auto-generated update timestamp
 *
 * @description Represents a coin package with a specific number of coins,
 * price, and validity duration. Supports daily, weekly, monthly, or custom durations.
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

    duration: {
      value: { type: Number, required: true, min: 1 },
      unit: {
        type: String,
        required: true,
        enum: ["day", "days", "week", "month"],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoinPackage", coinPackageSchema);
