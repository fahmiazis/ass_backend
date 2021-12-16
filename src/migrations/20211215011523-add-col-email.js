'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('emails', 'email_staff_asset1', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_staff_asset2', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_nom', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_bm', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_spv_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_fm', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_afm', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_staff_it', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_staff_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_spv_finance', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('emails', 'email_staff_admbank', {
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
    await queryInterface.removeColumn('emails', 'email_staff_asset1', {})
    await queryInterface.removeColumn('emails', 'email_staff_asset2', {})
    await queryInterface.removeColumn('emails', 'email_nom', {})
    await queryInterface.removeColumn('emails', 'email_bm', {})
    await queryInterface.removeColumn('emails', 'email_spv_tax', {})
    await queryInterface.removeColumn('emails', 'email_fm', {})
    await queryInterface.removeColumn('emails', 'email_afm', {})
    await queryInterface.removeColumn('emails', 'email_staff_it', {})
    await queryInterface.removeColumn('emails', 'email_staff_tax', {})
    await queryInterface.removeColumn('emails', 'email_spv_finance', {})
    await queryInterface.removeColumn('emails', 'email_staff_admbank', {})
  }
}
