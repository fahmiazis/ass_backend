'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('disposals', 'message_sap', {
      type: Sequelize.TEXT
    })
    await queryInterface.changeColumn('mutasis', 'message_sap', {
      type: Sequelize.TEXT
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('disposals', 'message_sap', {
      type: Sequelize.STRING
    })
    await queryInterface.changeColumn('mutasis', 'message_sap', {
      type: Sequelize.STRING
    })
  }
};
