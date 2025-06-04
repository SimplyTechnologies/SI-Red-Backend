import { Controller, Get, Route, Tags, Query, Delete, Path, Request, Security } from 'tsoa';
import createError from 'http-errors';
import UserService from '../services/UserService';
import { LIMIT, PAGE } from '../constants/constants';
import { UserAttributes } from '../types/user';
import { AuthenticatedRequest } from '../types/auth';
import { getUserIdOrThrow } from '../utils/auth';

@Route('users')
@Tags('User')
@Security('bearerAuth')
export class UserController extends Controller {
  @Get('/')
  public async getUsers(
    @Request() req: AuthenticatedRequest,
    @Query() page: number = PAGE,
    @Query() limit: number = LIMIT,
    @Query() search?: string
  ): Promise<{ total: number; users: UserAttributes[] }> {
    const userId = getUserIdOrThrow(req, this.setStatus.bind(this));
    return await UserService.getAllUsers({ page, limit, search, excludeUserId: userId });
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

    return await UserService.deleteUser(id);
  }
}
