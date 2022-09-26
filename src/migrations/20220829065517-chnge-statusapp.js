'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('disposals', 'status_app', 'no_persetujuan')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('disposals', 'no_persetujuan', 'status_app')
  }
}
