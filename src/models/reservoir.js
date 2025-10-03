'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class reservoir extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  reservoir.init({
    no_transaksi: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    transaksi: DataTypes.STRING,
    tipe: DataTypes.STRING,
    status: DataTypes.STRING,
    createdAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'reservoir'
  })
  return reservoir
}
