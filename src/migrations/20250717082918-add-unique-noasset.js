'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('assets', {
      fields: ['no_asset'],
      type: 'unique',
      name: 'unique_no_asset_constraint' // bebas, asal unik
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('assets', 'unique_no_asset_constraint')
  }
}
