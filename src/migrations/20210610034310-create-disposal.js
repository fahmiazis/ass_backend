'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('disposals', {
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
      nama_asset: {
        type: Sequelize.STRING
      },
      merk: {
        type: Sequelize.STRING
      },
      kategori: {
        type: Sequelize.ENUM('it', 'non-it')
      },
      status_depo: {
        type: Sequelize.ENUM('Cabang SAP', 'Cabang Scylla', 'Depo SAP', 'Depo Scylla')
      },
      cost_center: {
        type: Sequelize.STRING
      },
      nilai_buku: {
        type: Sequelize.STRING
      },
      nilai_jual: {
        type: Sequelize.STRING
      },
      keterangan: {
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
    await queryInterface.dropTable('disposals')
  }
}
