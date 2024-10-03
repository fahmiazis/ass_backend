'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('docUsers', 'status_dokumen', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('docUsers', 'desc', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('docUsers', 'status_dokumen', {})
    await queryInterface.removeColumn('docUsers', 'desc', {})
  }
}
