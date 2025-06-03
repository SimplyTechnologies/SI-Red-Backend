import { Controller, Get, Query, Route, Tags } from 'tsoa';
import UserService from '../services/UserService';
import { LIMIT, PAGE } from '../constants/constants';
import { UserAttributes } from '../types/user';

@Route('users')
@Tags('User')
export class UserController extends Controller {
  @Get('/')
  public async getUsers(
    @Query() page: number = PAGE,
    @Query() limit: number = LIMIT,
    @Query() search?: string
  ): Promise<{ total: number; users: UserAttributes[] }> {
    return await UserService.getAllUsers({ page, limit, search });
  }
}
