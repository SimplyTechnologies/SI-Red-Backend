import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

export const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

export async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully.');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}
