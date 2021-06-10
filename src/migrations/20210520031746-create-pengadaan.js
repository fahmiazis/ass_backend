'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pengadaans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_io: {
        type: Sequelize.STRING
      },
      no_doc: {
        type: Sequelize.STRING
      },
      no_asset: {
        type: Sequelize.STRING
      },
      qty: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.STRING
      },
      total: {
        type: Sequelize.STRING
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      kategori: {
        type: Sequelize.ENUM('budget', 'non-budget', 'return')
      },
      jenis: {
        type: Sequelize.ENUM('it', 'non-it', 'return')
      },
      alasan: {
        type: Sequelize.STRING
      },
      no_pengadaan: {
        type: Sequelize.STRING
      },
      status_app: {
        type: Sequelize.INTEGER
      },
      status_doc: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pengadaans')
  }
}
