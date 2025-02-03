'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('stocks', 'id_doc', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('stocks', 'id_doc', {})
  }
}
