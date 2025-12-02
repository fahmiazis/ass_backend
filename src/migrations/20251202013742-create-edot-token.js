'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('edot_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      app_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'App identifier (e.g., pma, edot-mini-apps)'
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Encrypted password'
      },
      raw_token: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Raw token dari response login (dengan salt)'
      },
      access_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Decoded access token untuk Bearer auth'
      },
      jti: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JWT ID untuk refresh token'
      },
      code_cipher: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: '6 digit code cipher untuk decode token'
      },
      exp: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Token expiry timestamp'
      },
      iat: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'Token issued at timestamp'
      },
      status: {
        type: Sequelize.ENUM('active', 'expired', 'inactive'),
        defaultValue: 'active'
      },
      last_used: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })

    // Index untuk pencarian cepat
    await queryInterface.addIndex('edot_tokens', ['app_id'])
    await queryInterface.addIndex('edot_tokens', ['status'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('edot_tokens')
  }
}