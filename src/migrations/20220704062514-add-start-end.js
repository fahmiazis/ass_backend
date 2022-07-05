'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('pengadaans', 'start', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('pengadaans', 'end', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('pengadaans', 'tglIo', {
      type: Sequelize.DataTypes.DATE
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('pengadaans', 'start', {})
    await queryInterface.removeColumn('pengadaans', 'end', {})
    await queryInterface.removeColumn('pengadaans', 'tglIo', {})
  }
}
