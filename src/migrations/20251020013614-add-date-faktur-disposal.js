'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('disposals', 'date_faktur', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('disposals', 'gl_debit', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'gl_credit', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('disposals', 'message_sap', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('mutasis', 'message_sap', {
      type: Sequelize.DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('disposals', 'date_faktur', {})
    await queryInterface.removeColumn('disposals', 'gl_debit', {})
    await queryInterface.removeColumn('disposals', 'gl_credit', {})
    await queryInterface.removeColumn('disposals', 'message_sap', {})
    await queryInterface.removeColumn('mutasis', 'message_sap', {})
  }
};
