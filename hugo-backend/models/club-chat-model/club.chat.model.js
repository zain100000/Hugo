/**
 * Club Chat Schema for real-time messaging in clubs
 * @typedef {Object} ClubChat
 * @property {mongoose.Types.ObjectId} club - Reference to the Club
 * @property {mongoose.Types.ObjectId} sender - User who sent the message
 * @property {string} text - Chat message text (max 1000 chars)
 * @property {"TEXT"|"IMAGE"|"VIDEO"|"ANNOUNCEMENT"|"SYSTEM"} type - Type of chat message
 * @property {string} [mediaUrl] - Optional media file URL
 * @property {mongoose.Types.ObjectId} [replyTo] - Reference to another ClubChat (if it's a reply)
 * @property {Array<ChatReaction>} reactions - Array of emoji reactions
 * @property {Array<ChatReadReceipt>} readBy - Array of read receipts
 * @property {boolean} isDeleted - Whether the message is deleted
 * @property {mongoose.Types.ObjectId} [deletedBy] - User who deleted the message
 * @property {Date} [deletedAt] - When the message was deleted
 * @property {Date} createdAt - When the message was created
 * @property {Date} updatedAt - When the message was last updated
 *
 * @typedef {Object} ChatReaction
 * @property {mongoose.Types.ObjectId} user - User who reacted
 * @property {string} emoji - Emoji used
 * @property {Date} reactedAt - Timestamp when reaction was added
 *
 * @typedef {Object} ChatReadReceipt
 * @property {mongoose.Types.ObjectId} user - User who read the message
 * @property {Date} readAt - Timestamp when the message was read
 */

const mongoose = require("mongoose");

const clubChatSchema = new mongoose.Schema(
  {
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "VIDEO", "ANNOUNCEMENT", "SYSTEM"],
      default: "TEXT",
    },
    mediaUrl: {
      type: String,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClubChat",
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        emoji: {
          type: String,
          required: true,
        },
        reactedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

clubChatSchema.index({ club: 1, createdAt: -1 });
clubChatSchema.index({ sender: 1 });
clubChatSchema.index({ type: 1 });
clubChatSchema.index({ "readBy.user": 1 });

module.exports = mongoose.model("ClubChat", clubChatSchema);
