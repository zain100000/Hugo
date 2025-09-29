const nodemailer = require("nodemailer");
const dns = require("dns");
const net = require("net");

console.log("🔧 ========== EMAIL HELPER INITIALIZATION ==========");
console.log("📧 Email User:", process.env.EMAIL_USER ? "Loaded" : "MISSING");
console.log(
  "🔑 Email Pass Length:",
  process.env.EMAIL_PASS
    ? process.env.EMAIL_PASS.length + " characters"
    : "MISSING"
);
console.log("🌐 Frontend URL:", process.env.FRONTEND_URL || "MISSING");

// Configuration options to try in order
const transporterConfigs = [
  {
    name: "Gmail SSL (Port 465)",
    config: {
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: false },
    },
  },
  {
    name: "Gmail TLS (Port 587)",
    config: {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
      tls: { rejectUnauthorized: false },
    },
  },
  {
    name: "Gmail Service",
    config: {
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      socketTimeout: 30000,
    },
  },
];

let activeTransporter = null;
let activeConfigName = "None";

/**
 * @function checkNetworkConnectivity
 * @description Diagnostic function to check network connectivity to Gmail SMTP
 */
const checkNetworkConnectivity = async () => {
  console.log("\n🌐 ========== NETWORK DIAGNOSTICS ==========");

  try {
    // Check DNS resolution
    console.log("🔍 Resolving smtp.gmail.com...");
    const addresses = await dns.promises.resolve4("smtp.gmail.com");
    console.log("✅ DNS Resolution successful:", addresses);

    // Check port connectivity
    console.log("🔌 Testing port connectivity...");
    const ports = [465, 587, 25];

    for (const port of ports) {
      const isAccessible = await new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 10000;

        socket.setTimeout(timeout);
        socket.on("connect", () => {
          console.log(`✅ Port ${port} is accessible`);
          socket.destroy();
          resolve(true);
        });

        socket.on("timeout", () => {
          console.log(`❌ Port ${port} connection timeout`);
          socket.destroy();
          resolve(false);
        });

        socket.on("error", (err) => {
          console.log(`❌ Port ${port} error: ${err.message}`);
          socket.destroy();
          resolve(false);
        });

        socket.connect(port, "smtp.gmail.com");
      });

      if (isAccessible) {
        console.log(`🎯 Recommended port: ${port}`);
        break;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Network diagnostics failed:", error.message);
    return false;
  }
};

/**
 * @function initializeTransporter
 * @description Try different configurations until one works
 */
const initializeTransporter = async () => {
  console.log("\n🔄 ========== INITIALIZING EMAIL TRANSPORTER ==========");

  // First run network diagnostics
  await checkNetworkConnectivity();

  for (const config of transporterConfigs) {
    console.log(`\n🔧 Trying configuration: ${config.name}`);

    try {
      const transporter = nodemailer.createTransport({
        ...config.config,
        debug: true,
        logger: true,
      });

      console.log("🔄 Testing connection...");
      await transporter.verify();
      console.log(`✅ SUCCESS with ${config.name}`);

      activeTransporter = transporter;
      activeConfigName = config.name;

      // Test sending a simple email
      console.log("🧪 Sending verification test email...");
      const testResult = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to ourselves for testing
        subject: "HUGO - Email Configuration Test",
        text: `This is a test email using ${config.name}. Your HUGO email system is working correctly!`,
        html: `<h1>HUGO Email Test</h1><p>This is a test email using <strong>${config.name}</strong>. Your HUGO email system is working correctly!</p>`,
      });

      console.log(`✅ Test email sent successfully via ${config.name}`);
      console.log(`   Message ID: ${testResult.messageId}`);

      return transporter;
    } catch (error) {
      console.log(`❌ FAILED with ${config.name}: ${error.message}`);
      if (error.code) console.log(`   Error Code: ${error.code}`);
      continue;
    }
  }

  console.log("❌ All transporter configurations failed");
  console.log("💡 Possible solutions:");
  console.log("   1. Check if Gmail App Password is correct");
  console.log("   2. Check network firewall settings");
  console.log("   3. Try using a different network (mobile hotspot)");
  console.log("   4. Verify 2-factor authentication is enabled");

  return null;
};

/**
 * @function sendEmail
 * @description Sends an email using the active transporter
 */
const sendEmail = async ({ to, subject, html }) => {
  console.log(`\n📤 ========== SENDING EMAIL ==========`);
  console.log(`   To: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Active Config: ${activeConfigName}`);

  if (!activeTransporter) {
    console.log("🔄 No active transporter, initializing...");
    await initializeTransporter();

    if (!activeTransporter) {
      console.log("❌ No working email configuration found");
      return false;
    }
  }

  const mailOptions = {
    from: `"HUGO" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    console.log("🚀 Sending email...");
    const info = await activeTransporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully!");
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`   Config Used: ${activeConfigName}`);

    return true;
  } catch (err) {
    console.error("❌ FAILED to send email:");
    console.error("   Error:", err.message);
    console.error("   Code:", err.code);
    console.error("   Config:", activeConfigName);

    // Try to reinitialize transporter on failure
    console.log("🔄 Attempting to reinitialize transporter...");
    activeTransporter = null;
    await initializeTransporter();

    if (activeTransporter) {
      console.log("🔄 Retrying email send with new transporter...");
      try {
        const retryInfo = await activeTransporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully on retry!");
        console.log(`   Message ID: ${retryInfo.messageId}`);
        return true;
      } catch (retryErr) {
        console.error("❌ Retry also failed:", retryErr.message);
        return false;
      }
    }

    return false;
  }
};

/**
 * @function getEmailTemplate
 * @description Generates a romantic/professional HTML email template for HUGO (dating app).
 */
const getEmailTemplate = (content, title = "") => {
  console.log(`🎨 Generating email template: ${title}`);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                padding: 20px !important;
            }
            .button {
                display: block !important;
                width: 100% !important;
                text-align: center !important;
            }
        }
    </style>
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
};

/**
 * @function sendPasswordResetEmail
 * @description Sends password reset email for HUGO.
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
  console.log(`\n🔐 ========== PASSWORD RESET EMAIL ==========`);
  console.log(`   To: ${toEmail}`);
  console.log(`   Token: ${resetToken.substring(0, 10)}...`);

  const resetLink = `${process.env.FRONTEND_URL}/super-admin/reset-password?token=${resetToken}`;
  console.log(`   Reset Link: ${resetLink}`);

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
      
      <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin-top:20px;">
        <p style="margin:0; color:#6c757d; font-size:12px;">
          Or copy this token manually: <code style="background:#e9ecef; padding:2px 6px; border-radius:4px;">${resetToken}</code>
        </p>
      </div>
    </div>
  `;

  const result = await sendEmail({
    to: toEmail,
    subject: "Reset Your HUGO Password ❤️",
    html: getEmailTemplate(content, "Password Reset"),
  });

  console.log(
    `📧 Password reset email result: ${result ? "✅ SUCCESS" : "❌ FAILED"}`
  );
  return result;
};

/**
 * @function sendOTPEmail
 * @description Generates a styled OTP (One-Time Password) email using HUGO's branding.
 */
exports.sendOTPEmail = async (toEmail, otp) => {
  console.log(`\n📨 ========== OTP EMAIL ==========`);
  console.log(`   To: ${toEmail}`);
  console.log(`   OTP: ${otp}`);

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

  console.log(`📧 OTP email result: ${result ? "✅ SUCCESS" : "❌ FAILED"}`);
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
  console.log(`\n📢 ========== STATUS UPDATE EMAIL ==========`);
  console.log(`   To: ${toEmail}`);
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
    `📧 Status update email result: ${result ? "✅ SUCCESS" : "❌ FAILED"}`
  );
  return result;
};

/**
 * @function testEmailConnection
 * @description Test email connection and configuration
 */
exports.testEmailConnection = async () => {
  console.log("\n🧪 ========== MANUAL EMAIL TEST ==========");
  const result = await initializeTransporter();

  if (result) {
    console.log("✅ EMAIL SYSTEM: OPERATIONAL");
    console.log(`   Active Configuration: ${activeConfigName}`);
    return {
      success: true,
      message: "Email system is operational",
      config: activeConfigName,
    };
  } else {
    console.log("❌ EMAIL SYSTEM: FAILED");
    return {
      success: false,
      message: "Email system failed to initialize",
    };
  }
};

/**
 * @function getEmailStatus
 * @description Get current email system status
 */
exports.getEmailStatus = () => {
  return {
    initialized: !!activeTransporter,
    config: activeConfigName,
    emailUser: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASS,
  };
};

// Initialize transporter when module loads
console.log("\n🚀 Initializing email system...");
setTimeout(() => {
  initializeTransporter().then((transporter) => {
    if (transporter) {
      console.log("\n🎉 ========== EMAIL SYSTEM READY ==========");
      console.log(`✅ Configuration: ${activeConfigName}`);
      console.log(`📧 Ready to send emails from: ${process.env.EMAIL_USER}`);
    } else {
      console.log("\n💥 ========== EMAIL SYSTEM FAILED ==========");
      console.log("❌ Please check your configuration and try again");
    }
  });
}, 1000);

console.log("✅ Email helper module loaded successfully");
