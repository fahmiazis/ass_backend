'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('approves', {
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
        type: Sequelize.ENUM('pembuat', 'pemeriksa', 'penyetuju')
      },
      kategori: {
        type: Sequelize.ENUM('budget', 'non-budget', 'return', 'all')
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
    await queryInterface.dropTable('approves')
  }
}
