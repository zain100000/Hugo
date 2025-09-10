const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error("Failed to send email:", err.message);
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
                  You’re receiving this email because you’re part of HUGO – the dating app where real connections happen.<br>
                  If this wasn’t you, please contact our support team immediately.
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
 * @function sendPasswordResetEmail
 * @description Sends password reset email for HUGO.
 */
exports.sendPasswordResetEmail = async (toEmail, resetToken) => {
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
        This reset link is valid for 1 hour. If you didn’t request it, you can safely ignore this email ❤️
      </p>

      <p>${resetToken}</p>
      
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Reset Your HUGO Password ❤️",
    html: getEmailTemplate(content, "Password Reset"),
  });
};

/**
 * @function sendOTPEmail
 * @description Generates a styled OTP (One-Time Password) email using HUGO's branding.
 */
exports.sendOTPEmail = async (toEmail, otp) => {
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

  return sendEmail({
    to: toEmail,
    subject: "Your HUGO Verification Code ❤️",
    html: getEmailTemplate(content, "HUGO Verification"),
  });
};

/**
 * @function sendStatusUpdateEmail
 * @description Sends an email to a user about their account status change (WARNED, SUSPENDED, BANNED).
 */
exports.sendStatusUpdateEmail = async (
  toEmail,
  userName,
  status,
  warningMessage = ""
) => {
  let subject = "";
  let contentHtml = "";

  switch (status.toUpperCase()) {
    case "WARNED":
      subject = "⚠️ Important: A warning has been issued for your HUGO account";
      contentHtml = `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #FFC107; font-size: 22px; margin-bottom: 16px; font-weight: 600;">
            Account Warning
          </h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 18px;">
            Hello <strong>${userName}</strong>,<br><br>
            This is an official warning regarding your recent activity on HUGO.
          </p>
          <p style="color: #2d3748; line-height: 1.6; margin: 14px 0; font-style: italic;">
            <strong>Reason for Warning:</strong><br>
            "${warningMessage}"
          </p>
          <p style="color: #e53e3e; font-size: 14px; margin: 18px 0;">
            ⚠️ Please note: Accumulating <strong>3 warnings</strong> will result in automatic account suspension.
          </p>
          <p style="color: #718096; font-size: 13px; margin: 18px 0;">
            Review our <a href="https://hugo.com/community-guidelines" target="_blank" style="color: #3182ce; text-decoration: none;">Community Guidelines</a> 
            to ensure your profile and behavior comply with our standards.
          </p>
        </div>
      `;
      break;

    case "SUSPENDED":
      subject = "🚫 Your HUGO account has been suspended";
      contentHtml = `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #dc3545; font-size: 22px; margin-bottom: 16px; font-weight: 600;">
            Account Suspended
          </h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 18px;">
            Hello <strong>${userName}</strong>,<br><br>
            Your HUGO account has been <strong>suspended</strong> due to a violation of our community standards.
          </p>
          <p style="color: #718096; font-size: 13px; margin: 18px 0;">
            This action was taken because you either violated our Terms of Service or accumulated too many warnings.
          </p>
          <p style="color: #e53e3e; font-size: 13px; margin: 18px 0;">
            To appeal this decision, please contact our support team at 
            <a href="mailto:support@hugo.com" style="color: #3182ce; text-decoration: none;">support@hugo.com</a>.
          </p>
        </div>
      `;
      break;

    case "BANNED":
      subject = "❌ Your HUGO account has been permanently banned";
      contentHtml = `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #dc3545; font-size: 22px; margin-bottom: 16px; font-weight: 600;">
            Account Banned
          </h2>
          <p style="color: #4a5568; line-height: 1.6; margin-bottom: 18px;">
            Hello <strong>${userName}</strong>,<br><br>
            We regret to inform you that your HUGO account has been 
            <strong>permanently banned</strong> due to a severe violation of our policies.
          </p>
          <p style="color: #e53e3e; font-size: 13px; margin: 18px 0;">
            This decision is final and cannot be reversed.
          </p>
        </div>
      `;
      break;

    default:
      console.warn("⚠️ Unknown status type in sendStatusUpdateEmail:", status);
      return false;
  }

  // Wrap content in your global email template
  const emailHtml = getEmailTemplate(contentHtml, "Account Status Update");

  // Send email
  return sendEmail({
    to: toEmail,
    subject,
    html: emailHtml,
  });
};
