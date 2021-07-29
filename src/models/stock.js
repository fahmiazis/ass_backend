'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class stock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  stock.init({
    kode_plant: DataTypes.STRING,
    area: DataTypes.STRING,
    no_asset: DataTypes.STRING,
    deskripsi: DataTypes.STRING,
    merk: DataTypes.STRING,
    satuan: DataTypes.STRING,
    unit: DataTypes.STRING,
    kondisi: DataTypes.STRING,
    lokasi: DataTypes.STRING,
    grouping: DataTypes.STRING,
    keterangan: DataTypes.STRING,
    no_stock: DataTypes.STRING,
    status_app: DataTypes.TINYINT,
    status_doc: DataTypes.TINYINT,
    status_form: DataTypes.TINYINT,
    tanggalStock: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'stock'
  })
  return stock
}
