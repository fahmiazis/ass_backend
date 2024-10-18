'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('listmenus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      kode_menu: {
        type: Sequelize.STRING
      },
      timeline: {
        type: Sequelize.INTEGER
      },
      jenis: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      access: {
        type: Sequelize.STRING
      },
      routes: {
        type: Sequelize.STRING
      },
      access_depo: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('listmenus');
  }
};