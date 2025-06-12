import jwt from 'jsonwebtoken';
import { transporter } from './mailer';
import { JWT_TOKEN_EXPIRATION } from '../../constants/constants';
import dotenv from 'dotenv';

dotenv.config();

export const sendResetPasswordEmail = async (
  userEmail: string,
  userId: string,
  firstName: string
) => {
  const token = jwt.sign({ userId, email: userEmail }, process.env.RESET_PASSWORD_TOKEN_SECRET!, {
    expiresIn: JWT_TOKEN_EXPIRATION.RESET_PASSWORD_TOKEN_EXPIRATION,
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"Dealer Desk" <no-reply@dealerdesk.com>',
    to: userEmail,
    subject: 'Reset Your Dealer Desk Password',
    html: `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 40px; max-width: 600px;">
    <h2 style="color: #0DCF89; margin-bottom: 16px;">Password Reset Request</h2>
    <p style="color: #555; line-height: 1.6;">Hi dear ${firstName},</p>
    <p style="color: #555; line-height: 1.6;">
      We received a request to reset your password. Click the button below to set a new password.
      If you did not request this, you can safely ignore this email.
    </p>
    
    <p style="color: #999; font-size: 12px; margin-top: 30px;">
      <b>This link is valid for 10 minutes. After that, it will expire for security reasons.</b>
    </p>
    <a href="${resetLink}" style="
      display: inline-block;
      background-color: #0DCF89;
        color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
    ">
      Reset Password
    </a>
  </div>
`,
  };

  await transporter.sendMail(mailOptions);
};
