'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class edot_token extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  edot_token.init({
    app_id: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    raw_token: DataTypes.TEXT,
    access_token: DataTypes.STRING,
    jti: DataTypes.TEXT,
    code_chiper: DataTypes.STRING,
    exp: DataTypes.BIGINT,
    iat: DataTypes.BIGINT,
    status: DataTypes.ENUM('active', 'expired', 'inactive'),
    last_used: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'edot_token',
  });
  return edot_token;
};