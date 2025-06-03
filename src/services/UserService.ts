import { User } from '../models/User.model';
import { Op, Sequelize } from 'sequelize';

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
            { email: { [Op.iLike]: `%${search}%` } },
            Sequelize.where(Sequelize.cast(Sequelize.col('role'), 'TEXT'), {
              [Op.iLike]: `%${search}%`,
            }),
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
}

export default new UserService();
