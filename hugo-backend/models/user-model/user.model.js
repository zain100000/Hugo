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
      enum: ["USER", "SUPER-ADMIN"],
      default: "USER",
    },

    isVerified: {
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

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BANNED"],
      default: "ACTIVE",
    },

    warnings: [
      {
        message: String,
        date: { type: Date, default: Date.now },
      },
    ],

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
