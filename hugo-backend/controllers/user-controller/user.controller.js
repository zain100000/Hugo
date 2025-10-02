const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v2: cloudinary } = require("cloudinary");
const User = require("../../models/user-model/user.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../../utilities/cloudinary/cloudinary.utility");
const {
  passwordRegex,
  hashPassword,
} = require("../../helpers/password-helper/password.helper");
const {
  generateSecureToken,
} = require("../../helpers/token-helper/token.helper");
const {
  sendPasswordResetEmail,
} = require("../../helpers/email-helper/email.helper");
const referralConfig = require("../../config/referral.config");

/**
 * @description Controller for user registration (with referral system)
 * @route POST /api/user/signup-user
 * @access Public
 */
exports.registerUser = async (req, res) => {
  let uploadedFileUrl = null;

  try {
    const {
      userName,
      email,
      password,
      phone,
      bio,
      gender,
      dob,
      referralCode,
      height,
      weight,
      occupation,
      currentAddress,
      nationality,
    } = req.body;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "User with this phone already exists",
        });
      }
    }

    let profilePictureUrl = null;
    if (req.files?.profilePicture) {
      const uploadResult = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture"
      );
      profilePictureUrl = uploadResult.url;
      uploadedFileUrl = uploadResult.url;
    }

    const hashedPassword = await hashPassword(password);

    // Award 100 coins to new user
    const initialCoins = 100;
    let referralBonus = 0;
    let inviter = null;
    let referredBy = null;

    // Handle referral bonus if referral code is provided
    if (referralCode) {
      inviter = await User.findOne({ referralCode });
      if (inviter) {
        referredBy = inviter._id;
        referralBonus = referralConfig.coinsPerInvite;

        inviter.invitesCount += 1;
        inviter.coins += referralConfig.coinsPerInvite;

        if (inviter.invitesCount % referralConfig.bonusThreshold === 0) {
          inviter.coins += referralConfig.bonusCoins;
        }

        await inviter.save();
      }
    }

    // Create user object after all variables are defined
    const user = new User({
      userName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      profilePicture: profilePictureUrl,
      bio,
      gender,
      dob,
      height,
      weight,
      occupation,
      currentAddress,
      nationality,
      coins: initialCoins + referralBonus, // 100 coins + referral bonus
      role: "USER",
      isVerified: false,
      referredBy: referredBy, // Add referredBy field here
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      user: {
        id: user._id,
        userName: user.userName,
        coins: user.coins,
        referralCode: user.referralCode,
        referredBy: inviter ? inviter.userName : null,
        signupBonus: initialCoins,
        referralBonus: referralBonus,
      },
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);

    if (uploadedFileUrl) {
      try {
        await deleteFromCloudinary(uploadedFileUrl);
      } catch (cloudErr) {
        console.error("❌ Failed to rollback Cloudinary upload:", cloudErr);
      }
    }

    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(409).json({
        success: false,
        message: "User with this phone already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller for user login
 * @route POST /api/user/signin-user
 * @access Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "SUSPENDED" || user.status === "BANNED") {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.status.toLowerCase()}. Please contact support.`,
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${remaining} minutes.`,
      });
    }

    if (user.lockUntil && user.lockUntil <= Date.now()) {
      await User.updateOne(
        { _id: user._id },
        { $set: { loginAttempts: 0, lockUntil: null } }
      );
      user.loginAttempts = 0;
      user.lockUntil = null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { loginAttempts: 1 } },
        { new: true }
      );

      if (updated.loginAttempts >= 3) {
        const lockTime = Date.now() + 30 * 60 * 1000;
        await User.updateOne(
          { _id: user._id },
          { $set: { lockUntil: lockTime } }
        );
        return res.status(423).json({
          success: false,
          message:
            "Too many failed login attempts. Account locked for 30 minutes.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        attempts: updated.loginAttempts,
      });
    }

    const sessionId = generateSecureToken();
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date(),
          sessionId,
        },
      },
      { new: true }
    );

    const payload = {
      role: updatedUser.role,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
      },
      sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { algorithm: "HS256" },
      (err, token) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Error generating token" });
        }

        res.cookie("accessToken", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 60 * 60 * 1000,
        });

        res.json({
          success: true,
          message: "User login successfully",
          user: {
            id: updatedUser.id,
            userName: updatedUser.userName,
            email: updatedUser.email,
            status: updatedUser.status,
          },
          token,
          expiresIn: 3600,
        });
      }
    );
  } catch (err) {
    console.error("Login Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error logging in" });
  }
};

/**
 * @description Controller to get Uer by ID
 * @route GET /api/user/get-user-by-id/:userId
 * @access Private (User)
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "-password -__v -refreshToken"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: user,
    });
  } catch (err) {
    console.error("get user by id Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @description Controller to update a user's profile
 * @route PATCH api/user/update-user/:userId
 * @access Private (User)
 */

exports.updateUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "USER") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized! Only User can update.",
      });
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      console.warn(`⚠️ User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const allowedFields = [
      "userName",
      "bio",
      "height",
      "weight",
      "occupation",
      "currentAddress",
      "nationality",
    ];
    let updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = req.body[field];
      }
    }

    // Explicitly exclude dob and gender from being updated
    if (req.body.dob !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Date of birth cannot be updated",
      });
    }

    if (req.body.gender !== undefined) {
      return res.status(400).json({
        success: false,
        message: "Gender cannot be updated",
      });
    }

    if (req.files?.profilePicture) {
      let existingPublicId = null;

      if (user.profilePicture) {
        try {
          const matches = user.profilePicture.match(
            /\/upload\/(?:v\d+\/)?([^\.]+)/
          );
          if (matches && matches[1]) {
            existingPublicId = matches[1];
          }
        } catch (error) {
          console.error("❌ Error extracting public ID:", error);
        }
      }

      const profilePictureUploadResult = await uploadToCloudinary(
        req.files.profilePicture[0],
        "profilePicture",
        existingPublicId
      );

      updates.profilePicture = profilePictureUploadResult.url;
    }

    if (Object.keys(updates).length === 0) {
      console.warn("⚠️ No valid fields provided for update");
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(201).json({
      success: true,
      message: "User updated successfully",
      updatedUser: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller for user logout
 * @route POST /api/user/logout
 * @access Public
 */
exports.logoutUser = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { sessionId: generateSecureToken() },
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(201).json({
      success: true,
      message: "Logout Successfully!",
    });
  } catch (err) {
    console.error("Error Logging Out:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @description Controller to handle forgot password - sending reset link to email
 * @route POST /api/user/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000;

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Link sent successfully! Please check your email",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Controller to reset password with token
 * @route POST /api/user/reset-password/:token
 * @access Public
 */
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date();
    user.sessionId = generateSecureToken();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Controller to verify reset token validity
 * @route GET /api/user/verify-reset-token/:token
 * @access Public
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    res.status(200).json({
      success: true,
      message: "Valid reset token",
    });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * @description Controller to delete user account with proper error handling and rollback
 * @route DELETE /api/user/delete-user-account/:userId
 * @access Private (User)
 */
exports.deleteUserAccount = async (req, res) => {
  let session = null;
  let cloudinaryPublicId = null;
  let originalProfilePicture = null;

  try {
    const { userId } = req.params;
    const requestingUserId = req.userId;

    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own account",
      });
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "User Not Found!",
      });
    }

    originalProfilePicture = user.profilePicture;

    if (user.profilePicture) {
      try {
        const urlParts = user.profilePicture.split("/");
        const uploadIndex = urlParts.findIndex((part) => part === "upload");
        if (uploadIndex !== -1 && urlParts.length > uploadIndex + 2) {
          cloudinaryPublicId = urlParts
            .slice(uploadIndex + 2)
            .join("/")
            .replace(/\.[^.]+$/, "");
        }
      } catch (error) {
        console.error("❌ Error extracting Cloudinary public ID:", error);
      }
    }

    if (cloudinaryPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(cloudinaryPublicId, {
          resource_type: "image",
        });

        if (result.result !== "ok") {
          console.warn("⚠️ Cloudinary deletion may have failed:", result);
        }
      } catch (error) {
        console.error(
          "❌ Error deleting profile picture from Cloudinary:",
          error
        );
      }
    }

    if (user.media && user.media.length > 0) {
      try {
        for (const mediaItem of user.media) {
          if (mediaItem.url) {
            try {
              await deleteFromCloudinary(
                mediaItem.url,
                mediaItem.type === "VIDEO" ? "video" : "image"
              );
            } catch (mediaError) {
              console.error("❌ Error deleting media item:", mediaError);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error processing user media deletion:", error);
      }
    }

    await User.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "User account and all associated data deleted successfully!",
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (transactionError) {
        console.error("❌ Error aborting transaction:", transactionError);
      }
    }

    if (cloudinaryPublicId && originalProfilePicture) {
      try {
        console.log(
          "⚠️ Attempting to restore Cloudinary image due to failed deletion"
        );

        console.warn(
          `Cloudinary image ${cloudinaryPublicId} was deleted but database operation failed`
        );
      } catch (restoreError) {
        console.error("❌ Error during restoration attempt:", restoreError);
      }
    }

    console.error("❌ Error deleting user account:", error);

    let errorMessage = "Server Error";
    if (error.name === "CastError") {
      errorMessage = "Invalid user ID format";
    } else if (error.code === 11000) {
      errorMessage = "Database constraint violation";
    }

    res.status(500).json({
      success: false,
      message: `Account deletion failed: ${errorMessage}`,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
