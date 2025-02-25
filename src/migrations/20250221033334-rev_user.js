'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mutasis', 'user_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'user_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('stocks', 'user_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'user_rev', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mutasis', 'user_rev', {})
    await queryInterface.removeColumn('pengadaans', 'user_rev', {})
    await queryInterface.removeColumn('stocks', 'user_rev', {})
    await queryInterface.removeColumn('disposals', 'user_rev', {})
  }
}
