/**
 * User Schema
 * @typedef {Object} User
 * @property {string} userName - Unique username for the user (trimmed)
 * @property {string} email - Unique email address for the user (lowercase)
 * @property {string} password - Hashed password for authentication (min 6 characters)
 * @property {string|null} [phone] - Optional unique phone number for the user
 * @property {string} [avatar=""] - URL or path to the user's avatar image
 * @property {string} [bio] - User biography (max 200 characters)
 * @property {string} [gender] - User gender, must be one of: "male", "female", "other"
 * @property {Date} [dob] - User date of birth
 * @property {number} [coins=0] - Virtual currency balance for the user
 * @property {string} [role="user"] - User role, either "user" or "super-admin"
 * @property {boolean} [isVerified=false] - Whether the user's account has been verified
 * @property {boolean} [isSuspended=false] - Whether the user's account is suspended
 * @property {Array.<mongoose.Types.ObjectId>} [followers] - Array of user IDs who follow this user
 * @property {Array.<mongoose.Types.ObjectId>} [following] - Array of user IDs this user follows
 * @property {Array.<mongoose.Types.ObjectId>} [blockedUsers] - Array of user IDs this user has blocked
 * @property {Date} [createdAt] - Date when the user account was created
 * @property {Date} [updatedAt] - Date when the user account was last updated
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
      default: null,
    },

    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
    },

    bio: {
      type: String,
      maxlength: 200,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
    },

    dob: {
      type: Date,
    },

    coins: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: ["USER"],
      default: "USER",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    sessionId: {
      type: String,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
