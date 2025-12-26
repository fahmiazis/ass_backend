'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class clossing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  clossing.init({
    jenis: DataTypes.STRING,
    start: DataTypes.INTEGER,
    end: DataTypes.INTEGER,
    periode: DataTypes.DATE,
    type_clossing: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'clossing'
  })
  return clossing
}
