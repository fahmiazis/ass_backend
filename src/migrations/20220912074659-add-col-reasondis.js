'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('disposals', 'reason', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('mutasis', 'reason', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('stocks', 'reason', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'reason', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disposals', 'reason', {})
    await queryInterface.removeColumn('mutasis', 'reason', {})
    await queryInterface.removeColumn('stocks', 'reason', {})
    await queryInterface.removeColumn('pengadaans', 'reason', {})
  }
}
