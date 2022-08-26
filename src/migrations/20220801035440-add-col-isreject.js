'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('disposals', 'isreject', {
      type: Sequelize.DataTypes.INTEGER
    })
    await queryInterface.addColumn('mutasis', 'isreject', {
      type: Sequelize.DataTypes.INTEGER
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('disposals', 'isreject', {})
    await queryInterface.removeColumn('mutasis', 'isreject', {})
  }
}
