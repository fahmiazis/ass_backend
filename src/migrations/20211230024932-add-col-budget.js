'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('mutasis', 'isbudget', {
      type: Sequelize.DataTypes.ENUM('ya', 'tidak')
    })
    await queryInterface.addColumn('mutasis', 'doc_sap', {
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
    await queryInterface.removeColumn('mutasis', 'isbudget', {})
    await queryInterface.removeColumn('mutasis', 'doc_sap', {})
  }
}
