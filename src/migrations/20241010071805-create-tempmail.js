'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tempmails', {
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
      message: {
        type: Sequelize.TEXT
      },
      cc: {
        type: Sequelize.TEXT
      },
      to: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
      },
      access: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tempmails');
  }
};