import { QueryInterface, DataTypes } from 'sequelize';

export = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('users', 'firstName', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'lastName', {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'phoneNumber', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('users', 'firstName');
    await queryInterface.removeColumn('users', 'lastName');
    await queryInterface.removeColumn('users', 'phoneNumber');
  },
};
