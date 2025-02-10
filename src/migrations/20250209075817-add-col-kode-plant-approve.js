'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('nameapproves', 'tipe', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('nameapproves', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'access', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'status', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'tipe', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('nameapproves', 'tipe', {})
    await queryInterface.removeColumn('nameapproves', 'kode_plant', {})
    await queryInterface.removeColumn('approves', 'access', {})
    await queryInterface.removeColumn('approves', 'status', {})
    await queryInterface.removeColumn('approves', 'tipe', {})
    await queryInterface.removeColumn('approves', 'kode_plant', {})
  }
}
