'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ttds', 'way_app', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'way_app', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ttds', 'way_app', {})
    await queryInterface.removeColumn('approves', 'way_app', {})
  }
}
