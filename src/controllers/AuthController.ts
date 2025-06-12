import { Body, Controller, Post, Route, Tags, SuccessResponse, Middlewares, Request } from 'tsoa';
import { AuthService } from '../services/AuthService';
import { SignInRequest, SignInResponse } from '../types/user';
import { validateResetPassword } from '../validations/resetPassword.validation';
import { validateRequest } from '../middlewares/validateRequest';
import { AuthenticatedRequest } from '../types/auth';

@Route('auth')
@Tags('Authentication')
export class AuthController extends Controller {
  @SuccessResponse('200', 'Signed in')
  @Post('/signin')
  public async signIn(@Body() body: SignInRequest): Promise<SignInResponse> {
    const { accessToken, refreshToken, user } = await new AuthService().signIn(
      body.email,
      body.password,
      body.rememberMe
    );

    return {
      message: 'Sign in successful',
      accessToken,
      refreshToken,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      role: user.role,
    };
  }

  @Post('/forgot-password')
  public async forgotPassword(@Body() body: { email: string }): Promise<{ message: string }> {
    return await new AuthService().forgotPassword(body.email);
  }

  @Post('/reset-password')
  @Middlewares([validateResetPassword, validateRequest])
  public async resetPassword(
    @Body()
    body: {
      token: string;
      password: string;
      confirmPassword: string;
    }
  ): Promise<{ message: string }> {
    return await new AuthService().resetPassword(body);
  }

  @Post('/request-password-reset')
  public async requestPasswordReset(
    @Request() req: AuthenticatedRequest
  ): Promise<{ message: string }> {
    return await new AuthService().requestPasswordReset(req.user!.userId);
  }

  @Post('/verify-reset-token')
  public async verifyResetToken(@Body() body: { token: string }): Promise<{ message: string }> {
    return await new AuthService().verifyResetToken(body.token);
  }
}
