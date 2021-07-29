'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_doc: {
        type: Sequelize.STRING
      },
      tanggal: {
        type: Sequelize.DATE
      },
      no_asset: {
        type: Sequelize.STRING
      },
      nama_asset: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      nilai_buku: {
        type: Sequelize.STRING
      },
      status: {
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assets')
  }
}
