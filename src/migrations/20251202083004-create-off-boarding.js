'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('off_boardings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company: {
        type: Sequelize.STRING(50)
      },
      department: {
        type: Sequelize.STRING(50)
      },
      direct_report: {
        type: Sequelize.STRING(150)
      },
      division: {
        type: Sequelize.STRING(50)
      },
      emp_email: {
        type: Sequelize.STRING(50)
      },
      employee: {
        type: Sequelize.STRING(150),
        unique: true
      },
      grade_id: {
        type: Sequelize.STRING(50)
      },
      job_title: {
        type: Sequelize.STRING(150)
      },
      last_day: {
        type: Sequelize.STRING(50)
      },
      location: {
        type: Sequelize.STRING(50)
      },
      office_mail: {
        type: Sequelize.STRING(50)
      },
      position: {
        type: Sequelize.STRING(50)
      },
      reason: {
        type: Sequelize.STRING(150)
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
    await queryInterface.dropTable('off_boardings');
  }
};