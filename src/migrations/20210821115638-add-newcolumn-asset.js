'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('assets', 'nilai_acquis', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('assets', 'accum_dep', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('assets', 'kategori', {
      type: Sequelize.DataTypes.ENUM('IT', 'NON IT')
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('assets', 'nilai_acquis', {})
    await queryInterface.removeColumn('assets', 'accum_dep', {})
    await queryInterface.removeColumn('assets', 'kategori', {})
  }
}
