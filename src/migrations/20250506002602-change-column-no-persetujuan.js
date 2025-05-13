'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('disposals', 'no_persetujuan', {
      type: Sequelize.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('disposals', 'no_persetujuan', {
      type: Sequelize.INTEGER
    })
  }
}
