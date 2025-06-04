import { User } from '../models/User.model';
import { sendVerificationEmail } from '../utils/email/sendVerificationEmail'; 
import { CreateUserDTO } from '../types/user';
import createError from 'http-errors';
import { USER_ROLE } from '../constants/constants';

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
}
