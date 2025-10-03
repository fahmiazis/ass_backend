'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('disposals', 'date_fulldis', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'date_fullset', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'date_persetujuan', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'date_budget', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'date_purch', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'date_tax', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'date_finance', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'date_finish', {
      type: Sequelize.DataTypes.DATE
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disposals', 'date_fulldis', {})
    await queryInterface.removeColumn('disposals', 'date_fullset', {})
    await queryInterface.removeColumn('disposals', 'date_persetujuan', {})
    await queryInterface.removeColumn('disposals', 'date_budget', {})
    await queryInterface.removeColumn('disposals', 'date_purch', {})
    await queryInterface.removeColumn('disposals', 'date_tax', {})
    await queryInterface.removeColumn('disposals', 'date_finance', {})
    await queryInterface.removeColumn('disposals', 'date_finish', {})
  }
}
