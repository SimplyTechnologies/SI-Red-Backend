import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';

export class VehicleImage extends Model {
  public id!: string;
  public vehicle_id!: string;
  public image_url!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VehicleImage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    vehicle_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'VehicleImage',
    tableName: 'vehicle_images',
    timestamps: true,
  }
);

export default VehicleImage;
