import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('vehicles', 'customer_id', {
    type: DataTypes.UUID,
    allowNull: true, 
    references: {
      model: 'customers', 
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL', 
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('vehicles', 'customer_id');
}