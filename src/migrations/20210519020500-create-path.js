'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('paths', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dokumen: {
        type: Sequelize.STRING
      },
      no_doc: {
        type: Sequelize.STRING
      },
      kode_plant: {
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
    await queryInterface.dropTable('paths')
  }
}
