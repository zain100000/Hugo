const {
  generateOTP,
  storeOTP,
  verifyOTP,
  canResendOTP,
  removeOTP,
} = require("../../utilities/otp/otp.utility");

const User = require("../../models/user-model/user.model");
const {
  sendOTPEmail,
  testEmailConnection,
} = require("../../helpers/email-helper/email.helper");

let verifiedUserPhones = new Set();
exports.verifiedUserPhones = verifiedUserPhones;

/**
 * @description Send OTP to user's phone number (via email as fallback)
 * @route POST /api/otp/send-otp
 * @access Public
 */
exports.sendUserOTP = async (req, res) => {
  console.log("\n📨 ========== SEND OTP REQUEST ==========");
  console.log("📱 Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { phone } = req.body;

    if (!phone) {
      console.log("❌ Phone number is required");
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    console.log(`🔍 Looking up user with phone: ${phone}`);
    const user = await User.findOne({ phone });

    if (!user) {
      console.log("❌ User not found for phone:", phone);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log(`✅ User found: ${user.email}`);
    console.log(`📧 User email: ${user.email}`);

    if (!user.email) {
      console.log("❌ User does not have an email");
      return res
        .status(400)
        .json({ success: false, message: "User does not have an email" });
    }

    console.log("⏰ Checking OTP resend limits...");
    if (!canResendOTP(phone)) {
      console.log("❌ OTP resend limit reached for phone:", phone);
      return res.status(429).json({
        success: false,
        message:
          "OTP resend limit reached. Please try again after a few minutes.",
      });
    }

    console.log("🔢 Generating OTP...");
    const otp = generateOTP();
    console.log(`✅ OTP generated: ${otp}`);

    console.log("💾 Storing OTP...");
    storeOTP(phone, otp);

    console.log("📤 Sending OTP email...");
    const sent = await sendOTPEmail(user.email, otp);

    if (!sent) {
      console.error("❌ FAILED to send OTP email to:", user.email);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP email" });
    }

    console.log("✅ OTP email sent successfully!");
    res.status(201).json({
      success: true,
      message: "OTP sent successfully, please check your email",
    });
  } catch (err) {
    console.error("❌ ERROR in sendUserOTP handler:");
    console.error("   Error:", err.message);
    console.error("   Stack:", err.stack);
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
  console.log("\n🔍 ========== VERIFY OTP REQUEST ==========");
  console.log("📱 Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      console.log("❌ Phone and OTP are required");
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    console.log(`🔍 Verifying OTP for phone: ${phone}`);
    console.log(`🔢 Provided OTP: ${otp}`);

    const isValid = verifyOTP(phone, otp);

    if (!isValid) {
      console.log("❌ Invalid or expired OTP");
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    console.log("✅ OTP verified successfully!");
    console.log("🔄 Updating user verification status...");

    const updatedUser = await User.findOneAndUpdate(
      { phone },
      {
        isPhoneVerified: true,
        isVerified: true,
        phoneVerification: {
          otp: null,
          expiresAt: null,
          attempts: 0,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log("❌ User not found after OTP verification");
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    console.log("✅ User verification status updated successfully");
    verifiedUserPhones.add(phone);
    removeOTP(phone);

    console.log(`📱 Phone ${phone} added to verified set`);
    console.log("✅ OTP verification process completed");

    res.status(201).json({
      success: true,
      message: "Phone verified successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("❌ ERROR verifying User OTP:");
    console.error("   Error:", err.message);
    console.error("   Stack:", err.stack);
    res
      .status(500)
      .json({ success: false, message: "Server error while verifying OTP" });
  }
};
