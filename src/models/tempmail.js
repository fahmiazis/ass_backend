'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class tempmail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  tempmail.init({
    type: DataTypes.STRING,
    menu: DataTypes.STRING,
    message: DataTypes.TEXT,
    cc: DataTypes.TEXT,
    to: DataTypes.TEXT,
    status: DataTypes.STRING,
    access: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tempmail'
  })
  return tempmail
}
