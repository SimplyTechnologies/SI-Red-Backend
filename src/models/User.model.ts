import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { UserAttributes, UserRole } from '../types/user';

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isVerified' | 'firstName' | 'lastName' | 'phoneNumber'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: UserRole;
  public isVerified!: boolean;

  public firstName!: string | null;
  public lastName!: string | null;
  public phoneNumber!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('SUPER_ADMIN', 'USER'),
      defaultValue: 'USER',
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);
