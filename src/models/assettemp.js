'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class assettemp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  assettemp.init({
    no_io: DataTypes.STRING,
    no_asset: DataTypes.STRING,
    qty: DataTypes.INTEGER,
    kode_plant: DataTypes.STRING,
    no_pengadaan: DataTypes.STRING,
    nama: DataTypes.STRING,
    price: DataTypes.STRING,
    idIo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'assettemp'
  })
  return assettemp
}
