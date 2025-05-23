import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { config } from 'dotenv';
import { JWT_TOKEN_EXPIRATION } from '../constants/constants';
import createHttpError from 'http-errors';
config();
import fs from 'fs';

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
}
