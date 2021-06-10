'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('emails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      email_area: {
        type: Sequelize.STRING
      },
      email_staff_purch: {
        type: Sequelize.STRING
      },
      email_spv_purch: {
        type: Sequelize.STRING
      },
      email_manager_purch: {
        type: Sequelize.STRING
      },
      email_am: {
        type: Sequelize.STRING
      },
      email_aam: {
        type: Sequelize.STRING
      },
      email_ga_spv: {
        type: Sequelize.STRING
      },
      email_staff_ga: {
        type: Sequelize.STRING
      },
      email_it_spv: {
        type: Sequelize.STRING
      },
      email_ism: {
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
    await queryInterface.dropTable('emails')
  }
}
