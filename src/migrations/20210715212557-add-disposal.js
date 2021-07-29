'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('disposals', 'nominal', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'no_sap', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'no_fp', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'doc_sap', {
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
    await queryInterface.removeColumn('disposals', 'nominal', {})
    await queryInterface.removeColumn('disposals', 'no_sap', {})
    await queryInterface.removeColumn('disposals', 'no_fp', {})
    await queryInterface.removeColumn('disposals', 'doc_sap', {})
  }
}
