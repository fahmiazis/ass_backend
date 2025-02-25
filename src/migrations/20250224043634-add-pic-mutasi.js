'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('mutasis', 'pic_aset', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('mutasis', 'pic_budget', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'pic_aset', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'pic_budget', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('stocks', 'pic_aset', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'pic_aset', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'pic_budget', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('mutasis', 'pic_aset', {})
    await queryInterface.removeColumn('mutasis', 'pic_budget', {})
    await queryInterface.removeColumn('pengadaans', 'pic_aset', {})
    await queryInterface.removeColumn('pengadaans', 'pic_budget', {})
    await queryInterface.removeColumn('stocks', 'pic_aset', {})
    await queryInterface.removeColumn('disposals', 'pic_aset', {})
    await queryInterface.removeColumn('disposals', 'pic_budget', {})
  }
}
