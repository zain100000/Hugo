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
      
    </div>
  `;

  return sendEmail({
    to: toEmail,
    subject: "Reset Your HUGO Password ❤️",
    html: getEmailTemplate(content, "Password Reset"),
  });
};
