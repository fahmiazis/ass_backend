'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roles', 'type', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('roles', 'type', {})
  }
}
