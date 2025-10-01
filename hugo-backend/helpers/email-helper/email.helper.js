const nodemailer = require("nodemailer");

console.log("🔧 Initializing Nodemailer Configuration...");
console.log("📧 Email User:", process.env.EMAIL_USER ? "✅ Set" : "❌ Missing");
console.log(
  "🔑 Email Pass Length:",
  process.env.EMAIL_PASS
    ? `${process.env.EMAIL_PASS.length} characters`
    : "❌ Missing"
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false,
  },
});

console.log("🔄 Testing SMTP Connection...");

// Verify connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("❌ SMTP Connection FAILED:", error.message);
    console.log("🔍 Error Details:", {
      code: error.code,
      command: error.command,
      response: error.response,
    });
  } else {
    console.log(
      "✅ SMTP Connection SUCCESSFUL - Server is ready to send emails"
    );
    console.log("📋 Connection Details:", {
      host: transporter.options.host,
      port: transporter.options.port,
      secure: transporter.options.secure,
    });
  }
});

/**
 * @function sendEmail
 * @description Sends an email using the configured transporter.
 */
const sendEmail = async ({ to, subject, html }) => {
  console.log("\n📨 ========== EMAIL SENDING PROCESS STARTED ==========");
  console.log("🎯 Target Email:", to);
  console.log("📝 Subject:", subject);
  console.log("🔧 Transporter Config:", {
    host: transporter.options.host,
    port: transporter.options.port,
    secure: transporter.options.secure,
    authUser: transporter.options.auth.user,
  });

  const mailOptions = {
    from: `"HUGO" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    console.log("🔄 Attempting to send email via SMTP...");
    console.log(
      "⏱️ Connection timeout set to:",
      transporter.options.connectionTimeout + "ms"
    );

    const startTime = Date.now();
    const info = await transporter.sendMail(mailOptions);
    const endTime = Date.now();

    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("📊 Email Details:", {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      timeTaken: `${endTime - startTime}ms`,
    });
    console.log("📨 ========== EMAIL PROCESS COMPLETED ==========\n");

    return true;
  } catch (err) {
    console.log("❌ EMAIL SENDING FAILED!");
    console.log("🚨 Error Details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
      stack: err.stack,
    });

    // Specific error handling
    if (err.code === "EAUTH") {
      console.log(
        "🔐 AUTHENTICATION ERROR: Check email credentials and App Password"
      );
    } else if (err.code === "ECONNECTION") {
      console.log(
        "🌐 CONNECTION ERROR: Check internet connection and SMTP settings"
      );
    } else if (err.code === "ETIMEDOUT") {
      console.log("⏰ TIMEOUT ERROR: SMTP server not responding");
    }

    console.log("📨 ========== EMAIL PROCESS FAILED ==========\n");
    return false;
  }
};

/**
 * @function getEmailTemplate
 * @description Generates a romantic/professional HTML email template for HUGO (dating app).
 */
const getEmailTemplate = (content, title = "") => {
  console.log("🎨 Generating email template...");
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background-color:#f7f9fc;">
  <!-- Email template remains the same -->
  ${content}
</body>
</html>
`;
};

/**
 * @function sendPasswordResetEmail
 * @description Sends password reset email for HUGO.
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  console.log("\n🔐 ========== PASSWORD RESET EMAIL PROCESS ==========");
  console.log("👤 Recipient:", toEmail);
  console.log("🔑 Reset Token:", resetToken);

  const resetLink = `${process.env.FRONTEND_URL}/super-admin/reset-password?token=${resetToken}`;
  console.log("🔗 Reset Link:", resetLink);

  const content = `
    <div style="text-align:center;">
      <h2 style="color:#2d3748; font-size:24px; margin-bottom:20px; font-weight:600;">Reset Your Password</h2>
      <p style="color:#4a5568; line-height:1.6; margin-bottom:25px;">
        We received a request to reset your HUGO account password. Click below to create a new one and get back to connecting:
      </p>

      <div style="margin:30px 0;">
        <a href="${resetLink}" style="background:linear-gradient(135deg, #8B0052 0%, #1E2F8D 100%); color:white; padding:16px 32px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block; font-size:16px;">
          Reset My Password
        </a>
      </div>

      <p style="color:#718096; font-size:14px; margin:20px 0;">
        This reset link is valid for 1 hour. If you didn't request it, you can safely ignore this email ❤️
      </p>
    </div>
  `;

  console.log("📧 Preparing to send password reset email...");
  const result = await sendEmail({
    to: toEmail,
    subject: "Reset Your HUGO Password ❤️",
    html: getEmailTemplate(content, "Password Reset"),
  });

  console.log(
    "📤 Password Reset Email Result:",
    result ? "✅ Success" : "❌ Failed"
  );
  console.log("🔐 ========== PASSWORD RESET PROCESS COMPLETED ==========\n");

  return result;
};

/**
 * @function sendOTPEmail
 * @description Generates a styled OTP (One-Time Password) email using HUGO's branding.
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  console.log("\n🔢 ========== OTP EMAIL PROCESS ==========");
  console.log("👤 Recipient:", toEmail);
  console.log("🔢 OTP Code:", otp);

  const content = `
    <div style="text-align: center;">
        <h2 style="color: #2d3748; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Your HUGO Verification Code</h2>
        <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            To keep your account secure, we need to verify it's really you. Use this One-Time Password to continue your HUGO journey:
        </p>
        
        <div style="background: linear-gradient(135deg, #8B0052 0%, #1E2F8D 100%); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; display: inline-block;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${otp}</div>
        </div>
        
        <p style="color: #e53e3e; font-size: 14px; margin: 20px 0;">
            ⚠️ This code expires in 5 minutes. Keep it secret, keep it safe!
        </p>
    </div>
  `;

  console.log("📧 Preparing to send OTP email...");
  const result = await sendEmail({
    to: toEmail,
    subject: "Your HUGO Verification Code ❤️",
    html: getEmailTemplate(content, "HUGO Verification"),
  });

  console.log("📤 OTP Email Result:", result ? "✅ Success" : "❌ Failed");
  console.log("🔢 ========== OTP PROCESS COMPLETED ==========\n");

  return result;
};

/**
 * @function sendUserStatusUpdateEmail
 * @description Sends email notification to user about account status change
 */
exports.sendUserStatusUpdateEmail = async (
  toEmail,
  status,
  warningCount = 0,
  warningMessage = ""
) => {
  console.log("\n📊 ========== USER STATUS EMAIL PROCESS ==========");
  console.log("👤 Recipient:", toEmail);
  console.log("📈 Status:", status);
  console.log("⚠️ Warning Count:", warningCount);
  console.log("💬 Warning Message:", warningMessage);

  let subject, content;

  switch (status) {
    case "WARNED":
      subject = `⚠️ Important: Warning Notice - HUGO Account Warning #${warningCount}`;
      content = `
        <div style="text-align: center;">
          <h2 style="color: #d69e2e; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Account Warning Notice</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 20px;">
            Your HUGO account has received a warning for violating our community guidelines.
          </p>
          
          <div style="background: #fffaf0; border: 1px solid #d69e2e; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #d69e2e; margin-top: 0;">Warning Details:</h3>
            <p style="color: #744210; font-style: italic;">"${warningMessage}"</p>
            <p style="color: #744210; margin-bottom: 0;">
              <strong>Warning ${warningCount} of 3</strong>
            </p>
          </div>
        </div>
      `;
      break;

    case "SUSPENDED":
      subject = "🚫 Account Suspended - HUGO";
      content = `
        <div style="text-align: center;">
          <h2 style="color: #e53e3e; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Account Suspended</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            Your HUGO account has been suspended due to multiple violations of our community guidelines.
          </p>
        </div>
      `;
      break;

    case "BANNED":
      subject = "🚫 Permanent Ban - HUGO Account Terminated";
      content = `
        <div style="text-align: center;">
          <h2 style="color: #c53030; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Account Permanently Banned</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            Your HUGO account has been permanently banned due to severe violations of our community guidelines.
          </p>
        </div>
      `;
      break;

    case "ACTIVE":
      subject = "✅ Account Restored - Welcome Back to HUGO!";
      content = `
        <div style="text-align: center;">
          <h2 style="color: #38a169; font-size: 24px; margin-bottom: 20px; font-weight: 600;">Account Restored</h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 25px;">
            Great news! Your HUGO account has been restored and is now active again.
          </p>
        </div>
      `;
      break;

    default:
      console.log("❌ Invalid status provided:", status);
      return false;
  }

  console.log("📧 Preparing to send status email...");
  console.log("📝 Email Subject:", subject);

  const result = await sendEmail({
    to: toEmail,
    subject: subject,
    html: getEmailTemplate(content, "Account Status Update"),
  });

  console.log("📤 Status Email Result:", result ? "✅ Success" : "❌ Failed");
  console.log("📊 ========== USER STATUS PROCESS COMPLETED ==========\n");

  return result;
};

// Add a test function that can be called directly
exports.testEmailConnection = async () => {
  console.log("\n🧪 ========== MANUAL EMAIL TEST ==========");
  console.log("🔧 Testing email configuration...");

  const testResult = await sendEmail({
    to: process.env.EMAIL_USER,
    subject: "HUGO - SMTP Connection Test",
    html: `
      <div style="text-align: center;">
        <h2>✅ HUGO Email System Test</h2>
        <p><strong>Status:</strong> SMTP Connection Test</p>
        <p><strong>Time:</strong> ${new Date().toString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || "development"}</p>
      </div>
    `,
  });

  console.log("🧪 Test Result:", testResult ? "✅ PASSED" : "❌ FAILED");
  console.log("🧪 ========== TEST COMPLETED ==========\n");

  return testResult;
};
