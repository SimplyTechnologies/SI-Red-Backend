import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('customers', 'deletedAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });

  await queryInterface.removeConstraint('vehicles', 'vehicles_customer_id_fkey').catch(() => {});

  await queryInterface.changeColumn('vehicles', 'customer_id', {
    type: DataTypes.UUID,
    allowNull: true,
  });

  await queryInterface.addConstraint('vehicles', {
    fields: ['customer_id'],
    type: 'foreign key',
    name: 'vehicles_customer_id_fkey',
    references: {
      table: 'customers',
      field: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('customers', 'deletedAt');

  await queryInterface.removeConstraint('vehicles', 'vehicles_customer_id_fkey');

  await queryInterface.changeColumn('vehicles', 'customer_id', {
    type: DataTypes.UUID,
    allowNull: false,
  });

  await queryInterface.addConstraint('vehicles', {
    fields: ['customer_id'],
    type: 'foreign key',
    name: 'vehicles_customer_id_fkey',
    references: {
      table: 'customers',
      field: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });
}
