const mongoose = require("mongoose");

/**
 * @typedef {Object} ChatMessage
 * @property {mongoose.Types.ObjectId} _id - Unique message identifier
 * @property {mongoose.Types.ObjectId} sender - User who sent the message
 * @property {string} text - Message content (max 1000 characters)
 * @property {"TEXT"|"IMAGE"|"VIDEO"|"FILE"} messageType - Type of message
 * @property {string} [mediaUrl] - URL for media files (images, videos, files)
 * @property {string} [fileSize] - Size of the media file
 * @property {boolean} isRead - Whether the message has been read by recipients
 * @property {Array<MessageReadReceipt>} readBy - Array of read receipts
 * @property {Date} sentAt - Timestamp when message was sent
 */

/**
 * @typedef {Object} MessageReadReceipt
 * @property {mongoose.Types.ObjectId} user - User who read the message
 * @property {Date} readAt - Timestamp when user read the message
 */

/**
 * @typedef {Object} LastMessage
 * @property {string} text - Preview of the last message
 * @property {Date} sentAt - Timestamp of the last message
 * @property {mongoose.Types.ObjectId} sender - User who sent the last message
 */

/**
 * @typedef {Object} Chat
 * @property {mongoose.Types.ObjectId} _id - Unique chat identifier
 * @property {Array<mongoose.Types.ObjectId>} participants - Users participating in this chat
 * @property {Array<ChatMessage>} messages - Array of chat messages
 * @property {LastMessage} lastMessage - Cached last message for quick access
 * @property {boolean} isActive - Whether the chat is active
 * @property {Date} createdAt - When the chat was created
 * @property {Date} updatedAt - When the chat was last updated
 */

/**
 * Mongoose schema for user-to-user direct messaging
 * @type {mongoose.Schema<Chat>}
 */
const chatSchema = new mongoose.Schema(
  {
    /**
     * Users participating in this chat conversation
     * Always contains exactly 2 users for 1-on-1 chats
     */
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
          validator: function (participants) {
            return participants.length === 2;
          },
          message: "Chat must have exactly 2 participants for 1-on-1 messaging",
        },
      },
    ],

    /**
     * Array of messages in this chat conversation
     * Ordered by sentAt timestamp (ascending)
     */
    messages: [
      {
        /**
         * User who sent this message
         */
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        /**
         * Message content
         */
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 1000,
        },

        /**
         * Type of message content
         */
        messageType: {
          type: String,
          enum: ["TEXT", "IMAGE", "VIDEO", "FILE"],
          default: "TEXT",
        },

        /**
         * URL for media files (images, videos, documents)
         */
        mediaUrl: {
          type: String,
        },

        /**
         * Human-readable file size (e.g., "2.5 MB", "150 KB")
         */
        fileSize: {
          type: String,
        },

        /**
         * Whether the message has been read by all participants
         */
        isRead: {
          type: Boolean,
          default: false,
        },

        /**
         * Track which users have read this message
         */
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

        /**
         * Timestamp when message was sent
         */
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /**
     * Cached last message data for efficient querying
     * Updated whenever a new message is added
     */
    lastMessage: {
      text: {
        type: String,
        default: "",
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    /**
     * Chat activity status
     * Inactive chats are archived but not deleted
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimal query performance
chatSchema.index({ participants: 1 }); // Find chats by participant
chatSchema.index({ "lastMessage.sentAt": -1 }); // Sort chats by recent activity
chatSchema.index({ isActive: 1 }); // Filter active/inactive chats
chatSchema.index({ updatedAt: -1 }); // Sort by last update
chatSchema.index({ participants: 1, updatedAt: -1 }); // Compound index for user chats

/**
 * Mongoose model for User-to-User Chat
 * @typedef {mongoose.Model<Chat>} ChatModel
 */
const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
