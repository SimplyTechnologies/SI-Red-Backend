import { DataTypes, Model as SequelizeModel, Optional } from 'sequelize';
import { sequelize } from '../config/db';

interface ModelAttributes {
  id: number;
  name: string;
  make_id: number;
}

type ModelCreationAttributes = Optional<ModelAttributes, 'id'>;

export class Model
  extends SequelizeModel<ModelAttributes, ModelCreationAttributes>
  implements ModelAttributes
{
  public id!: number;
  public name!: string;
  public make_id!: number;
}

Model.init(
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
    make_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'makes',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Model',
    tableName: 'models',
    timestamps: false,
  }
);
