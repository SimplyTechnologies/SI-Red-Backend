import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.renameColumn('customers', 'phone', 'phoneNumber');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.renameColumn('customers', 'phoneNumber', 'phone');
}
