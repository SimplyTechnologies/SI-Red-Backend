import { DataTypes, Model as SequelizeModel, Optional } from "sequelize";
import { sequelize } from "../config/db";
import { Make } from "./Make.model";

interface ModelAttributes {
  id: number;
  name: string;
  make_id: number;
}

interface ModelCreationAttributes extends Optional<ModelAttributes, "id"> {}

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
        model: "makes",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Model",
    tableName: "models",
    timestamps: false,
  }
);

// ✅ One Model belongs to one Make
Model.belongsTo(Make, { foreignKey: "make_id", as: "make" });

// ✅ One Model has many Vehicles
// Model.hasMany(Vehicle, { foreignKey: "model_id", as: "vehicles" });
