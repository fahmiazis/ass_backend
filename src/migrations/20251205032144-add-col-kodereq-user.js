'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'request_kode', {
      type: Sequelize.DataTypes.STRING(20)
    })
    await queryInterface.addColumn('users', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'request_kode', {})
    await queryInterface.removeColumn('users', 'history', {})
  }
}
