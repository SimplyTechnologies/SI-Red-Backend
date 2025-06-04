import { User } from '../models/User.model';
import { Op, Sequelize } from 'sequelize';
import createError from 'http-errors';

interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
}

class UserService {
  async getAllUsers({ page = 1, limit = 10, search }: GetUsersOptions) {
    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          [Op.or]: [
            Sequelize.where(
              Sequelize.fn('concat', Sequelize.col('firstName'), ' ', Sequelize.col('lastName')),
              {
                [Op.iLike]: `%${search}%`,
              }
            ),
          ],
        }
      : {};

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
