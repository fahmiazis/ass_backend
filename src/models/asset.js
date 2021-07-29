'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class asset extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  asset.init({
    no_doc: DataTypes.STRING,
    tanggal: DataTypes.DATE,
    no_asset: DataTypes.STRING,
    nama_asset: DataTypes.STRING,
    area: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    nilai_buku: DataTypes.STRING,
    status: DataTypes.STRING,
    deskripsi: DataTypes.STRING,
    merk: DataTypes.STRING,
    satuan: DataTypes.STRING,
    unit: DataTypes.STRING,
    kondisi: DataTypes.STRING,
    lokasi: DataTypes.STRING,
    grouping: DataTypes.STRING,
    keterangan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'asset'
  })
  return asset
}
