'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assettemps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_io: {
        type: Sequelize.STRING
      },
      no_asset: {
        type: Sequelize.STRING
      },
      qty: {
        type: Sequelize.INTEGER
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      no_pengadaan: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.STRING
      },
      idIo: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('assettemps')
  }
}
