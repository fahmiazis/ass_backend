'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assets', 'record_type', {
      type: Sequelize.DataTypes.STRING(10)
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('assets', 'record_type', {})
  }
}
