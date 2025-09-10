/**
 * Media Schema
 * @typedef {Object} Media
 * @property {mongoose.Types.ObjectId} user - Reference to the User who owns the media
 * @property {string} type - Type of media content (enum: "IMAGE", "VIDEO")
 * @property {string} url - URL or path to the media file
 * @property {Date} uploadedAt - Timestamp when the media was uploaded
 */

const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  type: {
    type: String,
    enum: ["IMAGE", "VIDEO"],
    required: true,
  },

  url: {
    type: String,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Media", mediaSchema);
