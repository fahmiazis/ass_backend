'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class status_stock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  status_stock.init({
    fisik: DataTypes.ENUM('ada', 'tidak ada'),
    kondisi: DataTypes.ENUM('baik', 'rusak'),
    status: DataTypes.STRING,
    isSap: DataTypes.ENUM('true', 'false')
  }, {
    sequelize,
    modelName: 'status_stock'
  })
  return status_stock
};
