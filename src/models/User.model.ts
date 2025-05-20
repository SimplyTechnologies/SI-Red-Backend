import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

export type UserRole = 'SUPER_ADMIN' | 'USER';

interface UserAttributes {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface UserCreationAttributes
    extends Optional<UserAttributes, 'id' | 'isVerified'> {}

export class User
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes
{
    public id!: string;
    public email!: string;
    public passwordHash!: string;
    public role!: UserRole;
    public isVerified!: boolean;

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
            defaultValue: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
    }
);
