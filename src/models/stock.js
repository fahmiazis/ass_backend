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
      stock.hasMany(models.path, {
        foreignKey: 'no_asset',
        as: 'pict',
        sourceKey: 'no_asset'
      })
      stock.hasMany(models.ttd, {
        foreignKey: 'no_doc',
        as: 'appForm',
        sourceKey: 'no_stock'
      })
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
    tanggalStock: DataTypes.DATE,
    status_fisik: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'stock'
  })
  return stock
}
