import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('users', 'forceLogoutAt', {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('users', 'forceLogoutAt');
}
