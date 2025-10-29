'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('depos', 'asman_ho', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'manager_ho', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('depos', 'asman_ho', {})
    await queryInterface.removeColumn('depos', 'manager_ho', {})
  }
};
