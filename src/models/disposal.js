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
        foreignKey: 'no_doc',
        as: 'ttdSet',
        sourceKey: 'no_persetujuan'
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
    no_persetujuan: DataTypes.STRING,
    status_reject: DataTypes.INTEGER,
    status_form: DataTypes.INTEGER,
    nominal: DataTypes.STRING,
    no_sap: DataTypes.STRING, // no document sap finance
    no_fp: DataTypes.STRING,
    doc_sap: DataTypes.STRING, // no document sap asset,
    tanggalDis: DataTypes.DATE,
    npwp: DataTypes.ENUM('ada', 'tidak'),
    doc_clearing: DataTypes.STRING,
    nilai_buku_eks: DataTypes.STRING,
    tgl_eksekusi: DataTypes.DATE,
    isreject: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    menu_rev: DataTypes.STRING,
    user_reject: DataTypes.INTEGER,
    history: DataTypes.TEXT,
    user_rev: DataTypes.STRING,
    pic_aset: DataTypes.STRING,
    pic_budget: DataTypes.STRING,
    pic_tax: DataTypes.STRING,
    pic_purch: DataTypes.STRING,
    pic_finance: DataTypes.STRING,
    date_budget: DataTypes.DATE,
    date_fulldis: DataTypes.DATE,
    date_fullset: DataTypes.DATE,
    date_persetujuan: DataTypes.DATE,
    date_purch: DataTypes.DATE,
    date_tax: DataTypes.DATE,
    date_finance: DataTypes.DATE,
    date_finish: DataTypes.DATE,
    ceo: DataTypes.STRING,
    date_ba: DataTypes.DATE,
    date_faktur: DataTypes.DATE,
    gl_debit: DataTypes.STRING,
    gl_credit: DataTypes.STRING,
    message_sap: DataTypes.STRING,
    nilai_acquis: DataTypes.TEXT,
    accum_dep: DataTypes.TEXT,
    cap_date: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'disposal'
  })
  return disposal
}
