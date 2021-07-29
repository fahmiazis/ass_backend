'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stocks', {
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
      no_asset: {
        type: Sequelize.STRING
      },
      deskripsi: {
        type: Sequelize.STRING
      },
      merk: {
        type: Sequelize.STRING
      },
      satuan: {
        type: Sequelize.STRING
      },
      unit: {
        type: Sequelize.STRING
      },
      kondisi: {
        type: Sequelize.STRING
      },
      lokasi: {
        type: Sequelize.STRING
      },
      grouping: {
        type: Sequelize.STRING
      },
      keterangan: {
        type: Sequelize.STRING
      },
      no_stock: {
        type: Sequelize.STRING
      },
      status_app: {
        type: Sequelize.TINYINT
      },
      status_doc: {
        type: Sequelize.TINYINT
      },
      status_form: {
        type: Sequelize.TINYINT
      },
      tanggalStock: {
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
    await queryInterface.dropTable('stocks')
  }
}
