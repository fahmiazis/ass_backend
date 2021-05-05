'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('depos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      profit_center: {
        type: Sequelize.STRING
      },
      kode_sap_1: {
        type: Sequelize.INTEGER
      },
      kode_sap_2: {
        type: Sequelize.INTEGER
      },
      cost_center: {
        type: Sequelize.STRING
      },
      nama_area: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      distribution: {
        type: Sequelize.STRING
      },
      nama_grom: {
        type: Sequelize.STRING
      },
      nama_rom: {
        type: Sequelize.STRING
      },
      nama_aos: {
        type: Sequelize.STRING
      },
      nama_pic_1: {
        type: Sequelize.STRING
      },
      nama_pic_2: {
        type: Sequelize.STRING
      },
      nama_pic_3: {
        type: Sequelize.STRING
      },
      nama_pic_4: {
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
    await queryInterface.dropTable('depos')
  }
}
