'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('disposals', 'nilai_acquis', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'accum_dep', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'cap_date', {
      type: Sequelize.DataTypes.DATE
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disposals', 'nilai_acquis', {})
    await queryInterface.removeColumn('disposals', 'accum_dep', {})
    await queryInterface.removeColumn('disposals', 'cap_date', {})
  }
};
