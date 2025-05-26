import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db';
import { MakeAttributes, MakeCreationAttributes } from '../types/make';

export class Make extends Model<MakeAttributes, MakeCreationAttributes> implements MakeAttributes {
  public id!: number;
  public name!: string;
}

Make.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Make',
    tableName: 'makes',
    timestamps: false,
  }
);
