import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { transporter } from './mailer';
import { JWT_TOKEN_EXPIRATION } from '../../constants/constants';

dotenv.config();

export const sendVerificationEmail = async (
  userEmail: string,
  userId: string,
  firstName: string
) => {
  const token = jwt.sign({ userId }, process.env.VERIFICATION_TOKEN_SECRET!, {
    expiresIn: JWT_TOKEN_EXPIRATION.VERIFICATION_TOKEN_EXPIRATION || '1d',
  });

  const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  const mailOptions = {
    from: '"Dealer Desk" <no-reply@dealerdesk.com',
    to: userEmail,
    subject: 'You’ve Been Invited – Activate Your Account',
    html: `
      <p>Hi ${firstName},</p>
      <p>You’ve been added to <strong>Dealer Desk</strong> by administrator.</p>
      <p>To access your account, please activate it by clicking the link below:</p>
      <p><a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">👉 Activate My Account</a></p>
      <p>This link is valid for 24 hours. After that, it will expire for security reasons.</p>
      <p>Once you click the link, you’ll be taken to a secure page to set your password and complete the activation process.</p>
      <p>If you weren’t expecting this invitation, you can safely ignore this message.</p>
      <p>Looking forward to having you with us!</p>
      <p>Best regards,<br/>The Dealer Desk Team</p>
    `,
  };
  await transporter.sendMail(mailOptions);
};
