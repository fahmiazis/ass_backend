'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('depos', 'pic_budget', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'pic_finance', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'pic_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'pic_purchasing', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('depos', 'pic_budget', {})
    await queryInterface.removeColumn('depos', 'pic_finance', {})
    await queryInterface.removeColumn('depos', 'pic_tax', {})
    await queryInterface.removeColumn('depos', 'pic_purchasing', {})
  }
}
