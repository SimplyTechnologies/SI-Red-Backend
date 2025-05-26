import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface MakeAttributes {
  id: number;
  name: string;
}

type MakeCreationAttributes = Optional<MakeAttributes, 'id'>;

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
