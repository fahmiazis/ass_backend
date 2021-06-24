'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('docUsers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nama_dokumen: {
        type: Sequelize.STRING
      },
      jenis_dokumen: {
        type: Sequelize.STRING
      },
      divisi: {
        type: Sequelize.STRING
      },
      no_pengadaan: {
        type: Sequelize.STRING
      },
      path: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      alasan: {
        type: Sequelize.STRING
      },
      jenis_form: {
        type: Sequelize.ENUM('disposal', 'pengadaan', 'stock')
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
    await queryInterface.dropTable('docUsers')
  }
}
