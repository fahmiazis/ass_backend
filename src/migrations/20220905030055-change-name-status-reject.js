'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('disposals', 'status_doc', 'status_reject')
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('disposals', 'status_reject', 'status_doc')
  }
}
