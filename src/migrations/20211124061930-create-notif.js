'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      jenis: {
        type: Sequelize.ENUM('disposal', 'mutasi', 'stock', 'pengadaan')
      },
      no_proses: {
        type: Sequelize.STRING
      },
      list_appr: {
        type: Sequelize.STRING
      },
      keterangan: {
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
    await queryInterface.dropTable('notifs')
  }
}
