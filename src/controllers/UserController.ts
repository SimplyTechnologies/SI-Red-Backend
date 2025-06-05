import {
  Controller,
  Post,
  Body,
  Route,
  Tags,
  SuccessResponse,
  Request,
  Get,
  Query,
  Delete,
  Path,
  Security,
  Middlewares,
} from 'tsoa';
import { UserService } from '../services/UserService';
import { UserResponse } from '../types/user';
import { CreateUserDTO } from '../types/user';
import { USER_ROLE } from '../constants/constants';
import createError from 'http-errors';
import { LIMIT, PAGE } from '../constants/constants';
import { UserAttributes } from '../types/user';
import { AuthenticatedRequest } from '../types/auth';
import { getUserIdOrThrow } from '../utils/auth';
import { validateCreateUser } from '../validations/addUser.validation';
import { validateRequest } from '../middlewares/validateRequest';

@Route('users')
@Tags('User')
@Security('bearerAuth')
export class UserController extends Controller {
  private userService = new UserService();

  @Post('/')
  @Middlewares([validateCreateUser, validateRequest])
  @SuccessResponse('201', 'User Created')
  public async createUser(
    @Request() req: AuthenticatedRequest,
    @Body() body: CreateUserDTO
  ): Promise<UserResponse> {
    if (req.user?.role !== USER_ROLE.SUPER_ADMIN) {
      throw new createError.Forbidden('Only superusers can create users');
    }

    const createdUser = await this.userService.createUser(body);
    return createdUser;
  }
  @Get('/')
  public async getUsers(
    @Request() req: AuthenticatedRequest,
    @Query() page: number = PAGE,
    @Query() limit: number = LIMIT,
    @Query() search?: string
  ): Promise<{ total: number; users: UserAttributes[] }> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    return await this.userService.getAllUsers({ page, limit, search, excludeUserId: userId });
  }

  @Delete('{id}')
  @Security('bearerAuth')
  public async deleteUser(
    @Request() req: AuthenticatedRequest,
    @Path() id: string
  ): Promise<{ message: string }> {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new createError.Forbidden('Only SUPER_ADMIN can delete users');
    }

    if (req.user.userId === id) {
      throw new createError.BadRequest('You cannot delete your own account');
    }

    return await this.userService.deleteUser(id);
  }
}
