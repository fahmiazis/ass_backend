'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pengadaans', 'date_ident_asset', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('pengadaans', 'date_fullapp', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('pengadaans', 'date_budget', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('pengadaans', 'date_eksekusi', {
      type: Sequelize.DataTypes.DATE
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pengadaans', 'date_ident_asset', {})
    await queryInterface.removeColumn('pengadaans', 'date_fullapp', {})
    await queryInterface.removeColumn('pengadaans', 'date_budget', {})
    await queryInterface.removeColumn('pengadaans', 'date_eksekusi', {})
  }
}
