'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('docusers', 'no_asset', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('docusers', 'no_asset', {})
  }
}
