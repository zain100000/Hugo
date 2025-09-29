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
      enum: ["PENDING_REVIEW", "SUCCESS", "REJECTED", "FAILED"],
      default: "PENDING_REVIEW",
    },

    paymentMethod: {
      type: String,
      enum: ["PAYONEER_MANUAL", "BANK_TRANSFER", "OTHER"],
      default: "PAYONEER_MANUAL",
    },

    gatewayResponse: {
      type: Object,
      default: null,
    },

    reference: {
      type: String,
      default: null,
    },

    // New fields for manual payment review
    receiptUrl: {
      type: String,
      required: true,
    },

    receiptPublicId: {
      type: String,
      required: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminNotes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
