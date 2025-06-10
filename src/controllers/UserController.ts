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
  Patch,
} from 'tsoa';
import { UserService } from '../services/UserService';
import { UpdateUserDTO, UpdateUserResponse, UserResponse } from '../types/user';
import { CreateUserDTO } from '../types/user';
import { USER_ROLE } from '../constants/constants';
import createError from 'http-errors';
import { LIMIT, PAGE } from '../constants/constants';
import { UserAttributes } from '../types/user';
import { AuthenticatedRequest } from '../types/auth';
import { getUserIdOrThrow } from '../utils/auth';
import { validateUpdateUser } from '../validations/updateUser.validation';
import { validateCreateUser } from '../validations/addUser.validation';
import { validateActivateUser } from '../validations/activateUser.validation';
import { validateRequest } from '../middlewares/validateRequest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

@Route('users')
@Tags('User')
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
  @Security('bearerAuth')
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

  @Get('/verify')
  public async verifyToken(@Query() token?: string): Promise<{ name: string; email: string }> {
    try {
      if (!token) {
        throw new createError.BadRequest('No token provided');
      }

      const decoded = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET!) as {
        userId: string;
      };
      const userId = decoded.userId;

      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new createError.NotFound('User not found');
      }

      if (user.firstName === null) {
        throw new createError.BadRequest('User first name cannot be null');
      }

      return { name: user.firstName, email: user.email };
    } catch (error) {
      console.error('Token verification error:', error);
      throw new createError.Unauthorized('Invalid or expired token');
    }
  }

  @Patch('/activate')
  @Middlewares([validateActivateUser, validateRequest])
  public async activateAccount(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      token: string;
    }
  ): Promise<{ message: string; redirectUrl: string }> {
    const { name, email, password, token } = body;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET!) as {
        userId: string;
        email: string;
      };
    } catch {
      throw new createError.Unauthorized('Invalid or expired activation token');
    }

    if (decoded.email !== email) {
      throw new createError.Unauthorized('Activation token does not match email');
    }

    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      throw new createError.NotFound('User not found.');
    }

    if (user.isVerified) {
      throw new createError.Conflict('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await user.update({
      firstName: name,
      passwordHash,
      isVerified: true,
    });

    return { message: 'Account activated successfully.', redirectUrl: '/auth/signin' };
  }

  @Patch('/')
  @Middlewares([validateUpdateUser, validateRequest])
  public async updateUser(
    @Request() req: AuthenticatedRequest,
    @Body() body: UpdateUserDTO
  ): Promise<UpdateUserResponse> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    const updatedUser = await this.userService.updateUser(userId, body);
    return updatedUser;
  }
}
