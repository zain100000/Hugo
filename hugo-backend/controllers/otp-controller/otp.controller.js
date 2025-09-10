const {
  generateOTP,
  storeOTP,
  verifyOTP,
  canResendOTP,
  removeOTP,
} = require("../../utilities/otp/otp.utility");

const User = require("../../models/user-model/user.model");
const { sendOTPEmail } = require("../../helpers/email-helper/email.helper");

let verifiedUserPhones = new Set();
exports.verifiedUserPhones = verifiedUserPhones;

/**
 * @description Send OTP to user's phone number (via email as fallback)
 * @route POST /api/otp/send-otp
 * @access Public
 */
exports.sendUserOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.email) {
      return res
        .status(400)
        .json({ success: false, message: "User does not have an email" });
    }

    if (!canResendOTP(phone)) {
      return res.status(429).json({
        success: false,
        message:
          "OTP resend limit reached. Please try again after a few minutes.",
      });
    }

    const otp = generateOTP();
    storeOTP(phone, otp);

    const sent = await sendOTPEmail(user.email, otp);

    if (!sent) {
      console.error("❌ Failed to send OTP email to:", user.email);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    res.status(201).json({
      success: true,
      message: "OTP sent successfully, please check your email",
    });
  } catch (err) {
    console.error("❌ Error in sendUserOTP handler:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while sending OTP" });
  }
};

/**
 * @description Verify OTP for user phone and set isVerified = true
 * @route POST /api/otp/verify-otp
 * @access Public
 */
exports.verifyUserOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    const isValid = verifyOTP(phone, otp);

    if (!isValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { phone },
      {
        isPhoneVerified: true,
        isVerified: true, // ✅ flip from false → true
        phoneVerification: {
          otp: null,
          expiresAt: null,
          attempts: 0,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    verifiedUserPhones.add(phone);
    removeOTP(phone);

    res.status(201).json({
      success: true,
      message: "Phone verified successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("❌ Error verifying User OTP:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while verifying OTP" });
  }
};
