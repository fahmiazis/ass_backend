'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('mutasis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      no_mutasi: {
        type: Sequelize.STRING
      },
      no_doc: {
        type: Sequelize.STRING
      },
      no_asset: {
        type: Sequelize.STRING
      },
      nama_asset: {
        type: Sequelize.STRING
      },
      merk: {
        type: Sequelize.STRING
      },
      kategori: {
        type: Sequelize.ENUM('IT', 'NON IT')
      },
      cost_center: {
        type: Sequelize.STRING
      },
      cost_center_rec: {
        type: Sequelize.STRING
      },
      area_rec: {
        type: Sequelize.STRING
      },
      kode_plant_rec: {
        type: Sequelize.STRING
      },
      status_app: {
        type: Sequelize.INTEGER
      },
      status_doc: {
        type: Sequelize.INTEGER
      },
      status_form: {
        type: Sequelize.INTEGER
      },
      alasan: {
        type: Sequelize.STRING
      },
      tanggalMut: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('mutasis')
  }
}
