'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('disposals', 'pic_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'pic_purch', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'pic_finance', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disposals', 'pic_tax', {})
    await queryInterface.removeColumn('disposals', 'pic_purch', {})
    await queryInterface.removeColumn('disposals', 'pic_finance', {})
  }
}
