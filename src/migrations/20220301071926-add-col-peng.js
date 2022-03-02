'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('pengadaans', 'ticket_code', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'isBudget', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'isAsset', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'uom', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'setup_date', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('pengadaans', 'asset_token', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'bidding_harga', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'ket_barang', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pengadaans', 'area', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('pengadaans', 'ticket_code', {})
    await queryInterface.removeColumn('pengadaans', 'isBudget', {})
    await queryInterface.removeColumn('pengadaans', 'isAsset', {})
    await queryInterface.removeColumn('pengadaans', 'uom', {})
    await queryInterface.removeColumn('pengadaans', 'setup_date', {})
    await queryInterface.removeColumn('pengadaans', 'asset_token', {})
    await queryInterface.removeColumn('pengadaans', 'bidding_harga', {})
    await queryInterface.removeColumn('pengadaans', 'ket_barang', {})
    await queryInterface.removeColumn('pengadaans', 'area', {})
  }
}
