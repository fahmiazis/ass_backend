'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('assets', 'cost_center', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('assets', 'profit_center', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('assets', 'cost_center', {})
    await queryInterface.removeColumn('assets', 'profit_center', {})
  }
}
