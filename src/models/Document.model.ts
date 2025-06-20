import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/db';
import { DocumentCategory } from '../types/document';
import { Customer } from './Customer.model';
import { Vehicle } from './Vehicle.model';

export class Document extends Model {
  declare id: string;
  declare name: string;
  declare category: DocumentCategory;
  declare customerId?: string;
  declare vehicleId?: string;
  declare fileUrl: string;
  declare mimeType: string;
  declare size: number;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare deletedAt?: Date;
}

Document.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(...Object.values(DocumentCategory)),
      allowNull: false
    },
    customerId: {
      type: DataTypes.UUID,
      references: {
        model: Customer,
        key: 'id'
      }
    },
    vehicleId: {
      type: DataTypes.UUID,
      references: {
        model: Vehicle,
        key: 'id'
      }
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'documents',
    paranoid: true 
  }
);
