import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from 'dotenv';
import { JWT_TOKEN_EXPIRATION } from '../constants/constants';
import createHttpError from 'http-errors';
import { sendResetPasswordEmail } from '../utils/email/sendResetPasswordEmail';
config();

export class AuthService {
  async signIn(
    email: string,
    password: string,
    rememberMe: boolean
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await User.findOne({ where: { email } });
    const isPasswordValid = user && (await bcrypt.compare(password, user.passwordHash));

    if (!user || !isPasswordValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const {
      ACCESS_TOKEN_EXPIRATION,
      REFRESH_TOKEN_EXPIRATION_SESSION,
      REFRESH_TOKEN_EXPIRATION_REMEMBERED,
    } = JWT_TOKEN_EXPIRATION;

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    const refreshTokenExpiresIn = rememberMe
      ? REFRESH_TOKEN_EXPIRATION_REMEMBERED
      : REFRESH_TOKEN_EXPIRATION_SESSION;

    const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: refreshTokenExpiresIn,
    });

    return { accessToken, refreshToken, user };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    if (!user.isVerified) {
      throw new createHttpError.BadRequest('Account is not verified.');
    }

    await sendResetPasswordEmail(user.email, user.id, user.firstName ?? 'User');

    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  async resetPassword(data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    const { token, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      throw new createHttpError.BadRequest('Passwords do not match');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch {
      throw new createHttpError.Unauthorized('Invalid or expired reset token');
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      throw new createHttpError.NotFound('User not found');
    }

    if (!user.isVerified) {
      throw new createHttpError.BadRequest('Account is not verified');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await user.update({ passwordHash });

    return { message: 'Password has been reset successfully' };
  }

  async requestPasswordReset(userId: string): Promise<{ message: string }> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new createHttpError.NotFound('User not found');
    }

    if (!user.isVerified) {
      throw new createHttpError.BadRequest('Account is not verified');
    }

    await sendResetPasswordEmail(user.email, user.id, user.firstName ?? 'User');

    return { message: 'Password reset email has been sent to your email address.' };
  }
}
