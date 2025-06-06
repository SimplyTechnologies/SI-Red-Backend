import { Body, Controller, Post, Route, Tags, SuccessResponse } from 'tsoa';
import { AuthService } from '../services/AuthService';
import { SignInRequest, SignInResponse } from '../types/user';

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
    
  

    return { message: 'Sign in successful', accessToken, refreshToken, role: user.role };
  }
}
