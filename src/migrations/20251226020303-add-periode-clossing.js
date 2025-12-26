'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('clossings', 'periode', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('clossings', 'type_clossing', {
      type: Sequelize.DataTypes.STRING(20)
    })
    await queryInterface.addColumn('stocks', 'periode_stock', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('stocks', 'start_stock', {
      type: Sequelize.DataTypes.TINYINT
    })
    await queryInterface.addColumn('stocks', 'end_stock', {
      type: Sequelize.DataTypes.TINYINT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('clossings', 'periode', {})
    await queryInterface.removeColumn('clossings', 'type_clossing', {})
    await queryInterface.removeColumn('stocks', 'periode_stock', {})
    await queryInterface.removeColumn('stocks', 'start_stock', {})
    await queryInterface.removeColumn('stocks', 'end_stock', {})
  }
}
