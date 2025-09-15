/**
 * @typedef {Object} Transaction
 * @property {mongoose.Types.ObjectId} userId
 * @property {mongoose.Types.ObjectId} packageId
 * @property {number} amount
 * @property {number} coins
 * @property {string} status
 * @property {string} paymentMethod
 * @property {Object} gatewayResponse
 */

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoinPackage",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    coins: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: ["PAYONEER", "TEST"],
      default: "PAYONEER",
    },

    gatewayResponse: {
      type: Object,
      default: null,
    },

    reference: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
