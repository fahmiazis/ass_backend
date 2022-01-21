'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('disposals', 'tgl_eksekusi', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('docUsers', 'periode', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('docUsers', 'no_stock', {
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
    await queryInterface.removeColumn('disposals', 'tgl_eksekusi', {})
    await queryInterface.removeColumn('docUsers', 'periode', {})
    await queryInterface.removeColumn('docUsers', 'no_stock', {})
  }
}
