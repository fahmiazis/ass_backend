'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('mutasis', 'cost_centerawal', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('mutasis', 'tgl_mutasifisik', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('mutasis', 'tgl_mutasisap', {
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
    await queryInterface.removeColumn('mutasis', 'cost_centerawal', {})
    await queryInterface.removeColumn('mutasis', 'tgl_mutasifisik', {})
    await queryInterface.removeColumn('mutasis', 'tgl_mutasisap', {})
  }
}
