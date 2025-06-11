import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';
import { UserAttributes, UserRole } from '../types/user';
import { USER_ROLE } from '../constants/constants';

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'isVerified' | 'firstName' | 'lastName' | 'phoneNumber'
>;

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
  public readonly forceLogoutAt!: Date | null;
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
      type: DataTypes.ENUM(USER_ROLE.SUPER_ADMIN, USER_ROLE.USER),
      defaultValue: USER_ROLE.USER,
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
    forceLogoutAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);
