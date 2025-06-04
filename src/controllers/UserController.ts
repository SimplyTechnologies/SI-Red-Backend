import { Controller, Post, Body, Route, Tags, SuccessResponse, Request } from 'tsoa';
import { UserService } from '../services/UserService';
import { UserResponse } from '../types/user';
import { CreateUserDTO } from '../types/user';
import { USER_ROLE } from '../constants/constants';
import createHttpError from 'http-errors';
import { AuthenticatedRequest } from '../types/auth';

@Route('users')
@Tags('User')
export class UserController extends Controller {
  private userService = new UserService();

  @Post('/')
  @SuccessResponse('201', 'User Created')
  public async createUser(@Request() req: AuthenticatedRequest, @Body() body: CreateUserDTO): Promise<UserResponse> {
    if (req.user.role !== USER_ROLE.SUPER_ADMIN) {
        console.log(">>>>>>>", "NOT SUPER USER");
        
      throw new createHttpError.Forbidden('Only superusers can create users');
    }

    const createdUser = await this.userService.createUser(body);
    return createdUser;
  }
}
