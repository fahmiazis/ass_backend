'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ttds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      jabatan: {
        type: Sequelize.STRING
      },
      jenis: {
        type: Sequelize.ENUM('it', 'non-it', 'all')
      },
      sebagai: {
        type: Sequelize.ENUM('pembuat', 'pemeriksa', 'penyetuju', 'penerima')
      },
      kategori: {
        type: Sequelize.ENUM('budget', 'non-budget', 'return')
      },
      nama: {
        type: Sequelize.STRING
      },
      path: {
        type: Sequelize.STRING
      },
      no_doc: {
        type: Sequelize.STRING
      },
      no_pengadaan: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      no_set: {
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
    await queryInterface.dropTable('ttds')
  }
}
