import { transporter } from './mailer';

export const sendUserDeletedEmail = async (userEmail: string, firstName: string) => {
  const mailOptions = {
    from: '"Dealer Desk" <no-reply@dealerdesk.com>',
    to: userEmail,
    subject: 'Your Account with Dealer Desk Has Been Deleted',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Hi ${firstName},</p>
        <p>This email confirms that your account with <strong>Dealer Desk</strong> (${userEmail}) has been deleted.</p>
        <p>If you have any questions, please contact the super admin.</p><br/>
        <p>Sincerely,<br/>The <strong>Dealer Desk</strong> Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
