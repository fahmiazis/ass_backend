'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pengadaans', 'id_applicant', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('disposals', 'id_applicant', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('stocks', 'id_applicant', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('mutasis', 'id_applicant', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pengadaans', 'id_applicant', {})
    await queryInterface.removeColumn('disposals', 'id_applicant', {})
    await queryInterface.removeColumn('stocks', 'id_applicant', {})
    await queryInterface.removeColumn('mutasis', 'id_applicant', {})
  }
}
