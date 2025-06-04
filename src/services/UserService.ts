import { User } from '../models/User.model';
import { Op, Sequelize } from 'sequelize';
import createError from 'http-errors';
import { GetUsersOptions } from '../types/user';
import { LIMIT, PAGE } from '../constants/constants';

class UserService {
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
