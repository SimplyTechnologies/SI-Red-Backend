import { DataTypes, Model as SequelizeModel, Optional } from 'sequelize';
import { sequelize } from '../config/db';

export type VehicleCreationAttributes = Optional<
  VehicleAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export interface VehicleAttributes {
  id: string;
  model_id: number;
  user_id: string;
  year: string;
  vin: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  status: string;
  location: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Vehicle
  extends SequelizeModel<VehicleAttributes, VehicleCreationAttributes>
  implements VehicleAttributes
{
  public id!: string;
  public model_id!: number;
  public user_id!: string;
  public year!: string;
  public vin!: string;
  public street!: string;
  public city!: string;
  public state!: string;
  public country!: string;
  public zipcode!: string;
  public status!: string;
  public location!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'models',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vin: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'in stock',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
  },
  {
    sequelize,
    modelName: 'Vehicle',
    tableName: 'vehicles',
    paranoid: true, // for soft deletes
    timestamps: true,
  }
);
