const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

// ---------- Gmail OAuth2 Setup ----------
console.log("🔧 Initializing Gmail OAuth2 Configuration...");
console.log("📧 Email User:", process.env.EMAIL_USER ? "✅ Set" : "❌ Missing");
console.log(
  "🔑 Client ID:",
  process.env.EMAIL_CLIENT_ID ? "✅ Set" : "❌ Missing"
);
console.log(
  "🔑 Client Secret:",
  process.env.EMAIL_CLIENT_SECRET ? "✅ Set" : "❌ Missing"
);
console.log(
  "🔑 Refresh Token:",
  process.env.EMAIL_REFRESH_TOKEN ? "✅ Set" : "❌ Missing"
);

const oauth2Client = new OAuth2(
  process.env.EMAIL_CLIENT_ID,
  process.env.EMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.EMAIL_REFRESH_TOKEN,
});

// ---------- Nodemailer Transporter ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.EMAIL_CLIENT_ID,
    clientSecret: process.env.EMAIL_CLIENT_SECRET,
    refreshToken: process.env.EMAIL_REFRESH_TOKEN,
    accessToken: async () => {
      const accessToken = await oauth2Client.getAccessToken();
      return accessToken.token;
    },
  },
});

console.log("🔄 Gmail OAuth2 transporter ready!");

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP Connection FAILED:", error.message);
  } else {
    console.log("✅ SMTP Connection SUCCESSFUL - Ready to send emails");
  }
});

// ---------- Generic Email Sender ----------
const sendEmail = async ({ to, subject, html }) => {
  console.log("\n📨 ========== EMAIL SENDING PROCESS STARTED ==========");
  console.log("🎯 Target Email:", to);
  console.log("📝 Subject:", subject);

  const mailOptions = {
    from: `"HUGO" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const startTime = Date.now();
    const info = await transporter.sendMail(mailOptions);
    const endTime = Date.now();

    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("📊 Email Details:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      timeTaken: `${endTime - startTime}ms`,
    });
    return true;
  } catch (err) {
    console.log("❌ EMAIL SENDING FAILED!", err);
    return false;
  }
};

// ---------- Email Template Generator ----------
const getEmailTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background-color:#f7f9fc;">
  ${content}
</body>
</html>
`;

// ---------- Password Reset Email ----------
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/super-admin/reset-password?token=${resetToken}`;

  const content = `
    <div style="text-align:center;">
      <h2 style="color:#2d3748; font-size:24px; margin-bottom:20px; font-weight:600;">Reset Your Password</h2>
      <p style="color:#4a5568; line-height:1.6; margin-bottom:25px;">
        Click below to reset your HUGO password:
      </p>
      <div style="margin:30px 0;">
        <a href="${resetLink}" style="background:linear-gradient(135deg, #8B0052 0%, #1E2F8D 100%); color:white; padding:16px 32px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block; font-size:16px;">
          Reset My Password
        </a>
      </div>
      <p style="color:#718096; font-size:14px; margin:20px 0;">
        This reset link is valid for 1 hour. If you didn't request it, ignore this email ❤️
      </p>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "Reset Your HUGO Password ❤️",
    html: getEmailTemplate(content, "Password Reset"),
  });
};

// ---------- OTP Email ----------
exports.sendOTPEmail = async (toEmail, otp) => {
  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Your HUGO Verification Code</h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            Use this OTP to continue your HUGO journey:
        </p>
        <div style="background: linear-gradient(135deg, #8B0052 0%, #1E2F8D 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; display: inline-block;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${otp}</div>
        </div>
        <p style="color: #e53e3e; font-size: 14px; margin: 20px 0;">
            ⚠️ This code expires in 5 minutes. Keep it secret!
        </p>
    </div>
  `;

  return await sendEmail({
    to: toEmail,
    subject: "Your HUGO Verification Code ❤️",
    html: getEmailTemplate(content, "HUGO Verification"),
  });
};

// ---------- User Status Update Email ----------
exports.sendUserStatusUpdateEmail = async (
  toEmail,
  status,
  warningCount = 0,
  warningMessage = ""
) => {
  let subject, content;

  switch (status) {
    case "WARNED":
      subject = `⚠️ Warning Notice - HUGO Account Warning #${warningCount}`;
      content = `<div style="text-align:center;">
        <h2 style="color:#d69e2e;">Account Warning Notice</h2>
        <p>Your account received a warning for violating guidelines.</p>
        <div style="background:#fffaf0;border:1px solid #d69e2e;border-radius:8px;padding:20px;">
          <p style="font-style:italic;">"${warningMessage}"</p>
          <p><strong>Warning ${warningCount} of 3</strong></p>
        </div>
      </div>`;
      break;
    case "SUSPENDED":
      subject = "🚫 Account Suspended - HUGO";
      content = `<div style="text-align:center;">
        <h2 style="color:#e53e3e;">Account Suspended</h2>
        <p>Your account has been suspended due to multiple violations.</p>
      </div>`;
      break;
    case "BANNED":
      subject = "🚫 Permanent Ban - HUGO Account Terminated";
      content = `<div style="text-align:center;">
        <h2 style="color:#c53030;">Account Permanently Banned</h2>
        <p>Your account has been permanently banned due to severe violations.</p>
      </div>`;
      break;
    case "ACTIVE":
      subject = "✅ Account Restored - Welcome Back!";
      content = `<div style="text-align:center;">
        <h2 style="color:#38a169;">Account Restored</h2>
        <p>Your HUGO account is now active again.</p>
      </div>`;
      break;
    default:
      console.log("❌ Invalid status:", status);
      return false;
  }

  return await sendEmail({
    to: toEmail,
    subject,
    html: getEmailTemplate(content, "Account Status Update"),
  });
};

// ---------- Test Email ----------
exports.testEmailConnection = async () => {
  return await sendEmail({
    to: process.env.EMAIL_USER,
    subject: "HUGO - Email Test",
    html: `<div style="text-align:center;">
        <h2>✅ HUGO Email System Test</h2>
        <p>Status: SMTP / Gmail API Test</p>
        <p>Time: ${new Date().toString()}</p>
        <p>Environment: ${process.env.NODE_ENV || "development"}</p>
      </div>`,
  });
};
