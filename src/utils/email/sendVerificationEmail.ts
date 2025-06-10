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

  const token = jwt.sign(
    { userId, email: userEmail },
    process.env.VERIFICATION_TOKEN_SECRET!,
    {
      expiresIn: JWT_TOKEN_EXPIRATION.VERIFICATION_TOKEN_EXPIRATION || '1d',
    }
  );

  const verificationLink = `${process.env.FRONTEND_URL}/activate?token=${token}`;

  const mailOptions = {
    from: '"Dealer Desk" <no-reply@dealerdesk.com>',
    to: userEmail,
    subject: 'You’ve Been Invited – Activate Your Account',
    html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <p>Hi ${firstName},</p>
      <p>You’ve been added to <strong>Dealer Desk</strong> by an administrator.</p><br/>
      <p>To access your account, please activate it by clicking the link below:</p>
      <p style="margin: 10px 0px;">
        <a href="${verificationLink}" style="
          background-color: #0DCF89;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          display: inline-block;
          font-weight: bold;
        ">
          Activate My Account
        </a>
      </p>
      <p><strong>This link is valid for 24 hours.</strong> After that, it will expire for security reasons.</p>
      <p>Once you click the link, you’ll be taken to a secure page to set your password and complete the activation process.</p><br/>
      <p>If you weren’t expecting this invitation, you can safely ignore this message.</p><br/>
      <p>Looking forward to having you with us!</p>
      <p>Best regards,<br/>The <strong>Dealer Desk</strong> Team</p>
    </div>
  `,
  };
  await transporter.sendMail(mailOptions);
};