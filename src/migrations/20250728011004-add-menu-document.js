'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('documents', 'template', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('documents', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('documents', 'stat_upload', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('documents', 'template', {})
    await queryInterface.removeColumn('documents', 'kode_plant', {})
    await queryInterface.removeColumn('documents', 'stat_upload', {})
  }
}
