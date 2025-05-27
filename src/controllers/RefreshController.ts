import { Controller, Post, Route, Tags, Body } from 'tsoa';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { RefreshRequest, RefreshResponse } from '../types/user';

@Route('auth')
@Tags('Authentication')
export class RefreshController extends Controller {
  @Post('/refresh')
  public async refresh(@Body() body: RefreshRequest): Promise<RefreshResponse> {
    const { refreshToken } = body;

    if (!refreshToken) {
      this.setStatus(401);
      return { message: 'No refresh token provided' };
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
        userId: string;
      };

      const user = await User.findByPk(decoded.userId);
      if (!user) {
        this.setStatus(401);
        return { message: 'User not found' };
      }

      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      return { newAccessToken };
    } catch (err) {
      console.error('Refresh token error:', err);
      this.setStatus(401);
      return { message: 'Invalid refresh token' };
    }
  }
}
