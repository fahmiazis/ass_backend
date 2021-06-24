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
      email_area_aos: {
        type: Sequelize.STRING
      },
      email_area_om: {
        type: Sequelize.STRING
      },
      email_staff_purch: {
        type: Sequelize.STRING
      },
      email_spv_purch_1: {
        type: Sequelize.STRING
      },
      email_spv_purch_2: {
        type: Sequelize.STRING
      },
      email_manager_purch: {
        type: Sequelize.STRING
      },
      email_spv_asset: {
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
    await queryInterface.dropTable('emails')
  }
}
