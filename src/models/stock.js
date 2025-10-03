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
      stock.hasMany(models.path, {
        foreignKey: 'no_asset',
        as: 'img',
        sourceKey: 'id'
      })
      stock.hasMany(models.ttd, {
        foreignKey: 'no_doc',
        as: 'appForm',
        sourceKey: 'no_stock'
      })
      stock.hasOne(models.asset, {
        foreignKey: 'no_asset',
        as: 'dataAsset',
        sourceKey: 'no_asset'
      })
      stock.hasOne(models.depo, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
      stock.hasOne(models.docUser, {
        foreignKey: 'id',
        as: 'doc',
        sourceKey: 'id_doc'
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
    status_fisik: DataTypes.STRING,
    reason: DataTypes.STRING,
    status_reject: DataTypes.INTEGER,
    isreject: DataTypes.INTEGER,
    menu_rev: DataTypes.STRING,
    user_reject: DataTypes.INTEGER,
    history: DataTypes.TEXT,
    image: DataTypes.STRING,
    date_img: DataTypes.DATE,
    id_doc: DataTypes.INTEGER,
    user_rev: DataTypes.STRING,
    pic_aset: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'stock'
  })
  return stock
}
