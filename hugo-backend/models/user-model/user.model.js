const mongoose = require("mongoose");

/**
 * User Schema
 * @typedef {Object} User
 * @property {string|null} [profilePicture] - URL or path to the user's profile picture
 * @property {string} userName - Unique username for the user (trimmed)
 * @property {string} email - Unique email address for the user (lowercase)
 * @property {string} password - Hashed password for authentication (min length: 6)
 * @property {string|null} [phone] - Unique phone number for the user
 * @property {string} [bio] - User biography (max length: 200 characters)
 * @property {string} [gender] - User gender (enum: "MALE", "FEMALE")
 * @property {Date} [dob] - User date of birth
 * @property {string} [role="USER"] - User role (enum: "USER", "SUPER-ADMIN")
 * @property {boolean} [isVerified=false] - Email verification status
 * @property {string} [status="ACTIVE"] - Account status (enum: "ACTIVE", "SUSPENDED", "BANNED")
 * @property {Date|null} [lastLogin] - Timestamp of the last successful login
 * @property {number} [loginAttempts=0] - Number of consecutive failed login attempts
 * @property {Date|null} [lockUntil] - Timestamp until which the account is locked due to excessive failed attempts
 * @property {string|null} [sessionId] - Current active session identifier
 * @property {Array.<Object>} [warnings] - Array of warning messages with timestamps
 * @property {Array.<mongoose.Types.ObjectId>} [followers] - Array of user IDs who follow this user
 * @property {Array.<mongoose.Types.ObjectId>} [following] - Array of user IDs this user follows
 * @property {Array.<mongoose.Types.ObjectId>} [blockedUsers] - Array of user IDs this user has blocked
 * @property {number} [coins=0] - Virtual currency balance
 * @property {string|null} [passwordResetToken] - Token for password reset functionality
 * @property {Date|null} [passwordResetExpires] - Expiration date for the password reset token
 * @property {boolean} [isPhoneVerified=false] - Phone verification status
 * @property {Object} [phoneVerification] - Phone verification details
 * @property {string|null} [phoneVerification.otp] - One-time password for phone verification
 * @property {Date|null} [phoneVerification.expiresAt] - Expiration date for the OTP
 * @property {number} [phoneVerification.attempts=0] - Number of OTP verification attempts
 * @property {Array.<Object>} [media] - Array of user media content (images and videos)
 * @property {mongoose.Types.ObjectId} media.user - User ID associated with the media
 * @property {string} media.type - Type of media (enum: "IMAGE", "VIDEO")
 * @property {string} media.url - URL to the media file
 * @property {Date} media.uploadedAt - Timestamp when media was uploaded
 * @property {Date} createdAt - Auto-generated creation timestamp
 * @property {Date} updatedAt - Auto-generated update timestamp
 */

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

    role: {
      type: String,
      enum: ["USER", "SUPER-ADMIN"],
      default: "USER",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BANNED", "WARNED"],
      default: "ACTIVE",
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

    warnings: [
      {
        message: String,
        date: { type: Date, default: Date.now },
      },
    ],

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

    coins: {
      type: Number,
      default: 0,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerification: {
      otp: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },

    media: [
      {
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
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
