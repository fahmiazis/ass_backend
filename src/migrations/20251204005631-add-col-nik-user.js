'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'nik', {
      type: Sequelize.DataTypes.STRING(50)
    })
    await queryInterface.addColumn('users', 'mpn_number', {
      type: Sequelize.DataTypes.STRING(50)
    })
    await queryInterface.addColumn('users', 'request_level', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('users', 'status_request', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'nik', {})
    await queryInterface.removeColumn('users', 'mpn_number', {})
    await queryInterface.removeColumn('users', 'request_level', {})
    await queryInterface.removeColumn('users', 'status_request', {})
  }
}
