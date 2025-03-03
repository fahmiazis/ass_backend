'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class mutasi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      mutasi.hasMany(models.ttd, {
        foreignKey: 'no_doc',
        as: 'appForm',
        sourceKey: 'no_mutasi'
      })
      mutasi.hasMany(models.path, {
        foreignKey: 'no_asset',
        as: 'pict',
        sourceKey: 'no_asset'
      })
      mutasi.hasOne(models.asset, {
        foreignKey: 'no_asset',
        as: 'dataAsset',
        sourceKey: 'no_asset'
      })
      mutasi.hasMany(models.docUser, {
        foreignKey: 'no_pengadaan',
        sourceKey: 'no_mutasi',
        as: 'docAsset'
      })
      mutasi.hasOne(models.depo, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
    }
  };
  mutasi.init({
    kode_plant: DataTypes.STRING,
    area: DataTypes.STRING,
    no_mutasi: DataTypes.STRING,
    no_doc: DataTypes.STRING,
    no_asset: DataTypes.STRING,
    nama_asset: DataTypes.STRING,
    merk: DataTypes.STRING,
    kategori: DataTypes.ENUM('IT', 'NON IT'),
    cost_center: DataTypes.STRING,
    cost_center_rec: DataTypes.STRING,
    area_rec: DataTypes.STRING,
    kode_plant_rec: DataTypes.STRING,
    status_app: DataTypes.INTEGER,
    status_doc: DataTypes.INTEGER,
    status_form: DataTypes.INTEGER,
    alasan: DataTypes.STRING,
    tanggalMut: DataTypes.DATE,
    isbudget: DataTypes.ENUM('ya', 'tidak'),
    doc_sap: DataTypes.STRING,
    no_io: DataTypes.STRING,
    cost_centerawal: DataTypes.STRING,
    tgl_mutasifisik: DataTypes.DATE,
    tgl_mutasisap: DataTypes.DATE,
    isreject: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    status_reject: DataTypes.INTEGER,
    menu_rev: DataTypes.STRING,
    user_reject: DataTypes.INTEGER,
    history: DataTypes.TEXT,
    user_rev: DataTypes.STRING,
    pic_aset: DataTypes.STRING,
    pic_budget: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'mutasi'
  })
  return mutasi
}
