'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('depos', 'nama_asman', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_asman', {
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
    await queryInterface.removeColumn('depos', 'nama_asman', {})
    await queryInterface.removeColumn('emails', 'email_asman', {})
  }
}
