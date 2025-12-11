'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stocks', 'nilai_buku', {
      type: Sequelize.DataTypes.STRING(100)
    })
    await queryInterface.addColumn('stocks', 'nilai_acquis', {
      type: Sequelize.DataTypes.STRING(100)
    })
    await queryInterface.addColumn('stocks', 'accum_dep', {
      type: Sequelize.DataTypes.STRING(100)
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stocks', 'nilai_buku', {})
    await queryInterface.removeColumn('stocks', 'nilai_acquis', {})
    await queryInterface.removeColumn('stocks', 'accum_dep', {})
  }
}
