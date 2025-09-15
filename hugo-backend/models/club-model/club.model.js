/**
 * Club Schema for chat rooms with user management and admin controls
 * @typedef {Object} Club
 * @property {string} name - Club name (max 50 chars)
 * @property {string} [description] - Club description (max 200 chars)
 * @property {mongoose.Types.ObjectId} admin - Reference to the admin User
 * @property {Array<ClubMember>} members - Array of club members
 * @property {boolean} isPublic - Whether the club is public or private
 * @property {number} maxMembers - Maximum number of members allowed
 * @property {string|null} image - Optional image URL for the club
 * @property {string} [rules] - Club rules (max 500 chars)
 * @property {string[]} tags - Array of tags for search/discovery
 * @property {boolean} isActive - Whether the club is active
 * @property {Array<ClubInvitation>} invitations - List of invitations
 * @property {Date} createdAt - Timestamp when created
 * @property {Date} updatedAt - Timestamp when last updated
 *
 * @typedef {Object} ClubMember
 * @property {mongoose.Types.ObjectId} user - Reference to the User
 * @property {Date} joinedAt - When the user joined
 * @property {"MEMBER"|"MODERATOR"|"ADMIN"} role - Role in the club
 * @property {"ACTIVE"|"MUTED"|"BANNED"|"KICKED"} status - Membership status
 *
 * @typedef {Object} ClubInvitation
 * @property {mongoose.Types.ObjectId} user - Invited User
 * @property {mongoose.Types.ObjectId} invitedBy - Who sent the invite
 * @property {Date} invitedAt - When the invite was sent
 * @property {"PENDING"|"ACCEPTED"|"REJECTED"|"EXPIRED"} status - Invitation status
 * @property {Date} expiresAt - Expiry date of the invitation
 */

const mongoose = require("mongoose");

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
    image: {
      type: String,
      default: null,
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
  },
  { timestamps: true }
);

clubSchema.index({ name: "text", description: "text" });
clubSchema.index({ admin: 1 });
clubSchema.index({ "members.user": 1 });
clubSchema.index({ isPublic: 1 });
clubSchema.index({ isActive: 1 });
clubSchema.index({ tags: 1 });
clubSchema.index({ createdAt: -1 });

clubSchema.virtual("memberCount").get(function () {
  return this.members.filter((member) => member.status === "ACTIVE").length;
});

clubSchema.virtual("onlineCount").get(function () {
  return 0;
});

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
  return this.members.some(
    (m) => m.user.toString() === userId.toString() && m.status === "BANNED"
  );
};

clubSchema.statics.findJoinableClubs = function (userId) {
  return this.find({
    isActive: true,
    isPublic: true,
    "members.user": { $ne: userId },
    "members.status": { $ne: "BANNED" },
    $expr: { $lt: [{ $size: "$members" }, "$maxMembers"] },
  });
};

module.exports = mongoose.model("Club", clubSchema);
