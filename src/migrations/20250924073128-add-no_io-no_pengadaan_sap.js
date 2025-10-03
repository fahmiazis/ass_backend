'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assets', 'no_io', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('assettemps', 'no_pengadaan_sap', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('assets', 'no_io', {})
    await queryInterface.removeColumn('assettemps', 'no_pengadaan_sap', {})
  }
}
