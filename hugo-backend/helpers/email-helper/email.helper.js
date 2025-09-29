const nodemailer = require("nodemailer");

console.log("🔧 Initializing email transporter...");
console.log("📧 Email User:", process.env.EMAIL_USER ? "Loaded" : "MISSING");
console.log(
  "🔑 Email Pass Length:",
  process.env.EMAIL_PASS
    ? process.env.EMAIL_PASS.length + " characters"
    : "MISSING"
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 60000,
  socketTimeout: 60000,
  debug: true,
  logger: true,
});

console.log("✅ Transporter configured");

/**
 * @function sendEmail
 * @description Sends an email using the configured transporter.
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"HUGO" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  console.log(`\n📤 Attempting to send email:`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   From: ${process.env.EMAIL_USER}`);

  try {
    console.log("🔍 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");

    console.log("🚀 Sending email...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);

    return true;
  } catch (err) {
    console.error("❌ FAILED to send email:");
    console.error("   Error Name:", err.name);
    console.error("   Error Message:", err.message);
    console.error("   Error Code:", err.code);
    console.error("   Command:", err.command);

    if (err.response) {
      console.error("   SMTP Response:", err.response);
    }

    if (err.responseCode) {
      console.error("   Response Code:", err.responseCode);
    }

    return false;
  }
};

/**
 * @function getEmailTemplate
 * @description Generates a romantic/professional HTML email template for HUGO (dating app).
 */
const getEmailTemplate = (content, title = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Arial, sans-serif; background-color:#f7f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f7f9fc;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; background:#ffffff; border-radius:14px; box-shadow:0 4px 20px rgba(0,0,0,0.08); overflow:hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #8B0052 0%, #1E2F8D 100%); padding:30px; text-align:center;">
              <img src="https://res.cloudinary.com/dd524q9vc/image/upload/v1757501045/Hugo/logo/logo_ifklls.png" alt="HUGO" style="width:160px; height:auto;"/>
              <h1 style="color:white; font-size:24px; margin:15px 0 0 0; font-weight:600;">HUGO</h1>
              <p style="color:#f1f1f1; font-size:14px; margin:8px 0 0;">Where Connections Begin ❤️</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;">
              ${content}
            </td>
          </tr>

          <tr>
            <td style="background:#f8f9fa; padding:25px 30px; text-align:center; border-top:1px solid #e9ecef;">
              <p style="margin:0; color:#6c757d; font-size:14px; line-height:1.6;">
                &copy; 2024 HUGO. All rights reserved.<br>
                <span style="font-size:12px; color:#868e96;">
                  You're receiving this email because you're part of HUGO – the dating app where real connections happen.<br>
                  If this wasn't you, please contact our support team immediately.
                </span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * @function testEmailConnection
 * @description Test email connection and send a test email
 */
const testEmailConnection = async () => {
  console.log("\n🧪 ========== EMAIL CONNECTION TEST ==========");
  try {
    console.log("🔧 Testing email configuration...");
    console.log("📧 Email user:", process.env.EMAIL_USER);
    console.log("🔑 Email pass length:", process.env.EMAIL_PASS?.length);

    console.log("🔄 Verifying transporter...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!");

    // Send a test email
    console.log("🚀 Sending test email...");
    const testResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "zabideen639@gmail.com",
      subject: "HUGO - Test Email Connection",
      text: "This is a test email from HUGO server to verify email functionality.",
      html: "<h1>HUGO Test Email</h1><p>This is a test email from HUGO server to verify email functionality.</p>",
    });

    console.log("✅ Test email sent successfully!");
    console.log("   Message ID:", testResult.messageId);
    console.log("   Response:", testResult.response);

    return true;
  } catch (error) {
    console.error("❌ Email test FAILED:");
    console.error("   Error Name:", error.name);
    console.error("   Error Message:", error.message);
    console.error("   Error Code:", error.code);

    if (error.response) {
      console.error("   SMTP Response:", error.response);
    }

    return false;
  }
};

// Test email connection when module loads
setTimeout(() => {
  testEmailConnection();
}, 2000);

/**
 * @function sendPasswordResetEmail
 * @description Sends password reset email for HUGO.
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  console.log(`\n🔐 Attempting to send password reset email to: ${toEmail}`);

  const resetLink = `${process.env.FRONTEND_URL}/super-admin/reset-password?token=${resetToken}`;
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

  const result = await sendEmail({
    to: toEmail,
    subject: "Reset Your HUGO Password ❤️",
    html: getEmailTemplate(content, "Password Reset"),
  });

  console.log(
    `📧 Password reset email result for ${toEmail}: ${result ? "SUCCESS" : "FAILED"}`
  );
  return result;
};

/**
 * @function sendOTPEmail
 * @description Generates a styled OTP (One-Time Password) email using HUGO's branding.
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  console.log(`\n📨 Attempting to send OTP email to: ${toEmail}`);
  console.log(`   OTP Code: ${otp}`);

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
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 13px;">
                If you didn't request this code, someone might be trying to access your account. 
                Please secure your account immediately.
            </p>
        </div>
    </div>
  `;

  const result = await sendEmail({
    to: toEmail,
    subject: "Your HUGO Verification Code ❤️",
    html: getEmailTemplate(content, "HUGO Verification"),
  });

  console.log(
    `📧 OTP email result for ${toEmail}: ${result ? "SUCCESS" : "FAILED"}`
  );
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
  console.log(`\n📢 Attempting to send status update email to: ${toEmail}`);
  console.log(`   Status: ${status}`);
  console.log(`   Warning Count: ${warningCount}`);
  console.log(`   Warning Message: ${warningMessage}`);

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
          
          <p style="color: #718096; line-height: 1.6;">
            <strong>Important:</strong> This is warning <strong>#${warningCount}</strong>. After <strong>3 warnings</strong>, your account will be automatically suspended.
          </p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
              Please review our <a href="${process.env.FRONTEND_URL}/community-guidelines" style="color: #8B0052;">Community Guidelines</a> to understand what behavior is acceptable on HUGO.
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
          
          <div style="background: #fed7d7; border: 1px solid #e53e3e; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #744210; margin: 0;">
              <strong>Reason:</strong> Received ${warningCount} warnings for guideline violations
            </p>
          </div>
          
          <p style="color: #718096; line-height: 1.6;">
            During this suspension period, you will not be able to access your account, upload media, or interact with other users.
          </p>
          
          <p style="color: #4a5568;">
            If you believe this suspension was made in error, please contact our support team for review.
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
          
          <div style="background: #fed7d7; border: 2px solid #c53030; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #744210; margin: 0; font-weight: 600;">
              This decision is final and cannot be appealed.
            </p>
          </div>
          
          <p style="color: #718096; line-height: 1.6;">
            You will no longer be able to access HUGO services with this account. Any attempt to create new accounts may result in immediate termination.
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
          
          <div style="background: #f0fff4; border: 1px solid #38a169; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="color: #2f855a; margin: 0;">
              You can now fully access all HUGO features and continue your journey to find meaningful connections.
            </p>
          </div>
          
          <p style="color: #718096; line-height: 1.6;">
            Please remember to follow our <a href="${process.env.FRONTEND_URL}/community-guidelines" style="color: #8B0052;">Community Guidelines</a> to ensure a positive experience for everyone.
          </p>
          
          <p style="color: #4a5568;">
            Welcome back to the HUGO community! ❤️
          </p>
        </div>
      `;
      break;

    default:
      console.log(`❌ Unknown status: ${status}`);
      return false;
  }

  const result = await sendEmail({
    to: toEmail,
    subject: subject,
    html: getEmailTemplate(content, "Account Status Update"),
  });

  console.log(
    `📧 Status update email result for ${toEmail}: ${result ? "SUCCESS" : "FAILED"}`
  );
  return result;
};
