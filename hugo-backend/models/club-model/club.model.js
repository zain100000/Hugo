/**
 * @file Club Model with Embedded Chat
 * @description
 * Defines the Club schema with members, invitations, and embedded chat messages.
 * Includes methods for checking roles, membership, and joinable clubs.
 *
 * @typedef {Object} ChatReaction
 * @property {mongoose.Types.ObjectId} user - User who reacted
 * @property {string} emoji - Emoji used
 * @property {Date} reactedAt - Timestamp of reaction
 *
 * @typedef {Object} ChatReadReceipt
 * @property {mongoose.Types.ObjectId} user - User who read the message
 * @property {Date} readAt - Timestamp when message was read
 *
 * @typedef {Object} ChatMessage
 * @property {mongoose.Types.ObjectId} sender - User who sent the message
 * @property {string} text - Message content (max 1000 chars)
 * @property {"TEXT"|"IMAGE"|"VIDEO"|"ANNOUNCEMENT"|"SYSTEM"} type - Message type
 * @property {string} [mediaUrl] - Optional media URL
 * @property {mongoose.Types.ObjectId} [replyTo] - Reference to another chat in the array
 * @property {ChatReaction[]} reactions - Array of reactions
 * @property {ChatReadReceipt[]} readBy - Array of read receipts
 * @property {boolean} isDeleted - Whether the message is deleted
 * @property {mongoose.Types.ObjectId} [deletedBy] - Who deleted the message
 * @property {Date} [deletedAt] - Deletion timestamp
 *
 * @typedef {Object} ClubMember
 * @property {mongoose.Types.ObjectId} user - Reference to the User
 * @property {Date} joinedAt - Join timestamp
 * @property {"MEMBER"|"MODERATOR"|"ADMIN"} role - Member role
 * @property {"ACTIVE"|"MUTED"|"BANNED"|"KICKED"} status - Membership status
 *
 * @typedef {Object} ClubInvitation
 * @property {mongoose.Types.ObjectId} user - Invited User
 * @property {mongoose.Types.ObjectId} invitedBy - Inviter User
 * @property {Date} invitedAt - Invitation timestamp
 * @property {"PENDING"|"ACCEPTED"|"REJECTED"|"EXPIRED"} status - Invitation status
 * @property {Date} expiresAt - Expiry timestamp
 *
 * @typedef {Object} Club
 * @property {string} name - Club name
 * @property {string} [description] - Club description
 * @property {string|null} clubImage - Club image URL
 * @property {mongoose.Types.ObjectId} admin - Admin User reference
 * @property {ClubMember[]} members - Array of club members
 * @property {boolean} isPublic - Public or private
 * @property {number} maxMembers - Max members allowed
 * @property {string} [rules] - Club rules
 * @property {string[]} tags - Club tags
 * @property {boolean} isActive - Whether club is active
 * @property {mongoose.Types.ObjectId[]} bannedUsers - Array of banned users
 * @property {ClubInvitation[]} invitations - Array of invitations
 * @property {ChatMessage[]} chats - Embedded chat messages
 * @property {Date} createdAt - Timestamp of creation
 * @property {Date} updatedAt - Timestamp of last update
 */

const mongoose = require("mongoose");

/* ----------------------- Subschemas ----------------------- */
const chatReactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  { _id: false }
);

const chatReadReceiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ----------------------- Club Schema ----------------------- */
const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    clubImage: {
      type: String,
      default: null,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ["MEMBER", "MODERATOR", "ADMIN"],
          default: "MEMBER",
        },
        status: {
          type: String,
          enum: ["ACTIVE", "MUTED", "BANNED", "KICKED"],
          default: "ACTIVE",
        },
      },
    ],

    isPublic: {
      type: Boolean,
      default: true,
    },

    maxMembers: {
      type: Number,
      default: 100,
      min: 2,
      max: 1000,
    },

    rules: {
      type: String,
      maxlength: 500,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    bannedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    invitations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"],
          default: "PENDING",
        },
        expiresAt: {
          type: Date,
          default: () => Date.now() + 7 * 24 * 60 * 60 * 1000,
        },
      },
    ],

    /* Embedded chat messages */
    chats: [
      {
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
        },
        reactions: [chatReactionSchema],
        readBy: [chatReadReceiptSchema],
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
    ],
  },
  { timestamps: true }
);

/* ----------------------- Indexes ----------------------- */
clubSchema.index({ name: "text", description: "text" });
clubSchema.index({ admin: 1 });
clubSchema.index({ "members.user": 1 });
clubSchema.index({ isPublic: 1 });
clubSchema.index({ isActive: 1 });
clubSchema.index({ tags: 1 });
clubSchema.index({ createdAt: -1 });
clubSchema.index({ "chats.sender": 1 });
clubSchema.index({ "chats.createdAt": -1 });

/* ----------------------- Virtuals ----------------------- */
clubSchema.virtual("memberCount").get(function () {
  return this.members.filter((member) => member.status === "ACTIVE").length;
});

clubSchema.virtual("onlineCount").get(function () {
  return 0; // Placeholder, can be replaced with real-time tracking
});

/* ----------------------- Instance Methods ----------------------- */
clubSchema.methods.isAdmin = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member && member.role === "ADMIN";
};

clubSchema.methods.isModerator = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member && (member.role === "MODERATOR" || member.role === "ADMIN");
};

clubSchema.methods.isMember = function (userId) {
  return this.members.some(
    (m) => m.user.toString() === userId.toString() && m.status === "ACTIVE"
  );
};

clubSchema.methods.isBanned = function (userId) {
  return this.bannedUsers.some((b) => b.toString() === userId.toString());
};

/* ----------------------- Static Methods ----------------------- */
clubSchema.statics.findJoinableClubs = function (userId) {
  return this.find({
    isActive: true,
    isPublic: true,
    "members.user": { $ne: userId },
    bannedUsers: { $ne: userId },
    $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] },
  });
};

module.exports = mongoose.model("Club", clubSchema);
