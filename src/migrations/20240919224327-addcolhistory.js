'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('disposals', 'menu_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('mutasis', 'menu_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('stocks', 'menu_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'menu_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'user_reject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('mutasis', 'user_reject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('stocks', 'user_reject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('pengadaans', 'user_reject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('disposals', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('mutasis', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('stocks', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('pengadaans', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disposals', 'menu_rev', {})
    await queryInterface.removeColumn('mutasis', 'menu_rev', {})
    await queryInterface.removeColumn('stocks', 'menu_rev', {})
    await queryInterface.removeColumn('pengadaans', 'menu_rev', {})
    await queryInterface.removeColumn('disposals', 'user_reject', {})
    await queryInterface.removeColumn('mutasis', 'user_reject', {})
    await queryInterface.removeColumn('stocks', 'user_reject', {})
    await queryInterface.removeColumn('pengadaans', 'user_reject', {})
    await queryInterface.removeColumn('disposals', 'history', {})
    await queryInterface.removeColumn('mutasis', 'history', {})
    await queryInterface.removeColumn('stocks', 'history', {})
    await queryInterface.removeColumn('pengadaans', 'history', {})
  }
}
