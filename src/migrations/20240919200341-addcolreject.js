'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mutasis', 'status_reject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('stocks', 'status_reject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('pengadaans', 'status_reject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('stocks', 'isreject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('pengadaans', 'isreject', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mutasis', 'status_reject', {})
    await queryInterface.removeColumn('stocks', 'status_reject', {})
    await queryInterface.removeColumn('pengadaans', 'status_reject', {})
    await queryInterface.removeColumn('stocks', 'isreject', {})
    await queryInterface.removeColumn('pengadaans', 'isreject', {})
  }
}
