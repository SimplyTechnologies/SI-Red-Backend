import { User } from '../models/User.model';
import { sendVerificationEmail } from '../utils/email/sendVerificationEmail';
import { CreateUserDTO, UpdateUserDTO, UpdateUserResponse } from '../types/user';
import createError from 'http-errors';
import { Op, Sequelize } from 'sequelize';
import { GetUsersOptions } from '../types/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

  public async getAllUsers({
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

  public async deleteUser(id: string): Promise<{ message: string }> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new createError.NotFound('User not found');
    }

    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  public async getUserById(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new createError.NotFound('User not found');
    }

    if (user.firstName === null) {
      throw new createError.BadRequest('User first name cannot be null');
    }

    return user;
  }

  public async getUserByEmail(email: string): Promise<User> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new createError.NotFound('User not found');
    }

    if (user.firstName === null) {
      throw new createError.BadRequest('User first name cannot be null');
    }

    return user;
  }

  public async verifyUser(token: string): Promise<{ name: string; email: string }> {
    try {
      const decoded = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET!) as {
        userId: string;
      };
      const userId = decoded.userId;

      const user = await this.getUserById(userId);

      if (!user) {
        throw new createError.NotFound('User not found');
      }

      if (user.firstName === null) {
        throw new createError.BadRequest('User first name cannot be null');
      }

      return { name: user.firstName, email: user.email };
    } catch {
      throw new createError.Unauthorized('Invalid or expired token');
    }
  }

  public async activateUser(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    token: string;
  }): Promise<{ message: string }> {
    const { name, email, password, confirmPassword, token } = data;

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

    const user = await this.getUserByEmail(email);

    if (user.isVerified) {
      throw new createError.Conflict('Account is already activated.');
    }

    if (password !== confirmPassword) {
      throw new createError.BadRequest('Passwords do not match.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await user.update({
      firstName: name,
      passwordHash,
      isVerified: true,
    });

    return { message: 'Account activated successfully.' };
  }
  async updateUser(userId: string, updates: UpdateUserDTO): Promise<UpdateUserResponse> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new createError.NotFound('User not found');
    }
    await user.update(updates);
    const { firstName, lastName, phoneNumber, email } = user;
    return { firstName, lastName, phoneNumber, email };
  }
}

export default new UserService();
