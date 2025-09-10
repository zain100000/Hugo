const express = require("express");
const router = express.Router();
const otpController = require("../../controllers/otp-controller/otp.controller");

/**
 * @description Route to send an OTP to a user.
 */
router.post("/send-otp", otpController.sendUserOTP);

/**
 * @description Route to verify a user's OTP.
 */
router.post("/verify-otp", otpController.verifyUserOTP);

module.exports = router;
