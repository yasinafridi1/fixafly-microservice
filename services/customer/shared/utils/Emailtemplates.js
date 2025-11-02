import { sendSupportMail } from "../services/NodeMailer.js";

export const sendOtpEmail = async (userEmail, otp) => {
  const message = {
    to: userEmail,
    subject: "Welcome to Fixafly - Password Reset OTP",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f5f7fa; padding: 30px;">
      <table align="center" width="600" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr>
          <td style="background: #1966DA; padding: 10px; text-align: center;">
            <img src="https://fixafly.s3.eu-north-1.amazonaws.com/uploads/logo.png" alt="Fixafly Logo" style="height: 150px;"/>
          </td>
        </tr>
        
        <!-- Body -->
        <tr>
          <td style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.6;">
            <p>Dear User,</p>
            <p>We received a request to reset your password for your <strong>Fixafly</strong> account.</p>
            <p><strong>Your One-Time Password (OTP) is:</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 8px 30px; background: #1966DA; color: #ffffff; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 3px;">
                ${otp}
              </div>
            </div>
            
            <p>Please do not share this OTP with anyone. OTP will expire in 3 minutes.</p>
            <p>If you did not request a password reset, please ignore this email or contact our support team immediately.</p>
            <p>Best regards,<br/>The Fixafly Support Team</p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="background: #f0f0f0; text-align: center; padding: 15px; font-size: 13px; color: #777;">
            © ${new Date().getFullYear()} Fixafly. All rights reserved.<br/>
            Need help? <a href="mailto:support@fixafly.com" style="color: #1966DA; text-decoration: none;">Contact Support</a>
          </td>
        </tr>
        
      </table>
    </div>
    `,
  };

  await sendSupportMail(message);
  return;
};
