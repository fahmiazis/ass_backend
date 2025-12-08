'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('on_boardings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      business_title: {
        type: Sequelize.STRING(150)
      },
      company: {
        type: Sequelize.STRING(50)
      },
      department: {
        type: Sequelize.STRING(50)
      },
      division: {
        type: Sequelize.STRING(50)
      },
      emp_email: {
        type: Sequelize.STRING(50)
      },
      grade_id: {
        type: Sequelize.STRING(50)
      },
      job_title: {
        type: Sequelize.STRING(150)
      },
      join_date: {
        type: Sequelize.STRING(50)
      },
      location: {
        type: Sequelize.STRING(50)
      },
      mpn_number: {
        type: Sequelize.STRING(50),
        unique: true
      },
      office_mail: {
        type: Sequelize.STRING(50)
      },
      position: {
        type: Sequelize.STRING(50)
      },
      qty_new: {
        type: Sequelize.STRING(50)
      },
      qty_replacement: {
        type: Sequelize.STRING(50)
      },
      requestor: {
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
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('on_boardings')
  }
}
