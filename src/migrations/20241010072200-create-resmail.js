'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('resmails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      menu: {
        type: Sequelize.STRING
      },
      subject: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      from: {
        type: Sequelize.STRING
      },
      to: {
        type: Sequelize.TEXT
      },
      cc: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      history: {
        type: Sequelize.TEXT
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      no_transaksi: {
        type: Sequelize.STRING
      },
      type_trans: {
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
    await queryInterface.dropTable('resmails')
  }
}
