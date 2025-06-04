import { User } from '../models/User.model';
import { sendVerificationEmail } from '../utils/email/sendVerificationEmail';
import { CreateUserDTO } from '../types/user';
import createError from 'http-errors';
import { Op, Sequelize } from 'sequelize';
import { GetUsersOptions } from '../types/user';
import { LIMIT, PAGE, USER_ROLE } from '../constants/constants';

export class UserService {
  public async createUser(data: CreateUserDTO) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
      throw new createError.Conflict('A user with this email already exists.');
    }

    const user = await User.create({
      email: data.email,
      passwordHash: '',
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      isVerified: false,
      role: USER_ROLE.USER,
    });

    await sendVerificationEmail(user.email, user.id, user.firstName ?? '');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    };
  }
  async getAllUsers({
    page = PAGE,
    limit = LIMIT,
    search,
    excludeUserId,
  }: GetUsersOptions & { excludeUserId?: string }) {
    const offset = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {
      ...(search && {
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')),
            {
              [Op.iLike]: `%${search}%`,
            }
          ),
        ],
      }),
      ...(excludeUserId && {
        id: { [Op.ne]: excludeUserId },
      }),
    };

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      users: rows.map((user) => user.get({ plain: true })),
    };
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new createError.NotFound('User not found');
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }
}

export default new UserService();
