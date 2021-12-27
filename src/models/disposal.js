'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class disposal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      disposal.hasMany(models.ttd, {
        foreignKey: 'no_doc',
        as: 'appForm',
        sourceKey: 'no_disposal'
      })
      disposal.hasMany(models.path, {
        foreignKey: 'no_asset',
        as: 'pict',
        sourceKey: 'no_asset'
      })
      disposal.hasMany(models.ttd, {
        foreignKey: 'no_set',
        as: 'ttdSet',
        sourceKey: 'status_app'
      })
      disposal.hasOne(models.asset, {
        foreignKey: 'no_asset',
        as: 'dataAsset',
        sourceKey: 'no_asset'
      })
      disposal.hasMany(models.docUser, {
        foreignKey: 'no_pengadaan',
        sourceKey: 'no_asset',
        as: 'docAsset'
      })
      disposal.hasOne(models.depo, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
    }
  };
  disposal.init({
    kode_plant: DataTypes.STRING,
    area: DataTypes.STRING,
    no_io: DataTypes.STRING,
    no_disposal: DataTypes.STRING,
    no_doc: DataTypes.STRING,
    no_asset: DataTypes.STRING,
    nama_asset: DataTypes.STRING,
    merk: DataTypes.STRING,
    kategori: DataTypes.ENUM('IT', 'NON IT'),
    status_depo: DataTypes.ENUM('Cabang SAP', 'Cabang Scylla', 'Depo SAP', 'Depo Scylla'),
    cost_center: DataTypes.STRING,
    nilai_buku: DataTypes.STRING,
    nilai_jual: DataTypes.STRING,
    keterangan: DataTypes.STRING,
    status_app: DataTypes.INTEGER,
    status_doc: DataTypes.INTEGER,
    status_form: DataTypes.INTEGER,
    nominal: DataTypes.STRING,
    no_sap: DataTypes.STRING, // no document sap finance
    no_fp: DataTypes.STRING,
    doc_sap: DataTypes.STRING, // no document sap asset,
    tanggalDis: DataTypes.DATE,
    npwp: DataTypes.ENUM('ada', 'tidak'),
    doc_clearing: DataTypes.STRING,
    nilai_buku_eks: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'disposal'
  })
  return disposal
}
