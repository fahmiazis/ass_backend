'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('disposals', 'ceo', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disposals', 'ceo', {})
  }
}
