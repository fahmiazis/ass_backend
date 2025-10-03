'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('depos', 'status_area', {
      type: Sequelize.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('depos', 'status_area', {
      type: Sequelize.ENUM
    })
  }
}
