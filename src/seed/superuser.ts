import bcrypt from 'bcryptjs';
import { User } from '../models';
import { sequelize } from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

async function seedSuperUser() {
  await sequelize.sync();

  const email = process.env.SUPERUSER_EMAIL!;
  const password = process.env.SUPERUSER_PASSWORD!;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log('ℹ️ Super user already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    email,
    passwordHash,
    role: 'SUPER_ADMIN',
  });

  console.log(`✅ Super user created: ${email}`);
}

seedSuperUser();
