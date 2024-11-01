'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class pengadaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      pengadaan.hasOne(models.depo, {
        foreignKey: 'kode_plant',
        sourceKey: 'kode_plant',
        as: 'depo'
      })
      pengadaan.hasMany(models.docUser, {
        foreignKey: 'no_pengadaan',
        sourceKey: 'id',
        as: 'doc'
      })
      pengadaan.hasMany(models.ttd, {
        foreignKey: 'no_doc',
        as: 'appForm',
        sourceKey: 'no_pengadaan'
      })
      pengadaan.hasMany(models.assettemp, {
        foreignKey: 'idIo',
        as: 'temp',
        sourceKey: 'id'
      })
      // define association here
    }
  };
  pengadaan.init({
    no_io: DataTypes.STRING,
    no_doc: DataTypes.STRING,
    no_asset: DataTypes.STRING,
    qty: DataTypes.STRING,
    nama: DataTypes.STRING,
    price: DataTypes.STRING,
    total: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    kategori: DataTypes.ENUM('budget', 'non-budget', 'return'),
    jenis: DataTypes.ENUM('it', 'non-it'),
    alasan: DataTypes.STRING,
    no_pengadaan: DataTypes.STRING,
    status_app: DataTypes.INTEGER,
    status_doc: DataTypes.INTEGER,
    ticket_code: DataTypes.STRING,
    isBudget: DataTypes.STRING,
    isAsset: DataTypes.STRING,
    uom: DataTypes.STRING,
    setup_date: DataTypes.STRING,
    asset_token: DataTypes.STRING,
    bidding_harga: DataTypes.STRING,
    ket_barang: DataTypes.STRING,
    area: DataTypes.STRING,
    status_form: DataTypes.STRING,
    tipe: DataTypes.STRING,
    akta: DataTypes.STRING,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    tglIo: DataTypes.DATE,
    reason: DataTypes.STRING,
    status_reject: DataTypes.INTEGER,
    isreject: DataTypes.INTEGER,
    menu_rev: DataTypes.STRING,
    user_reject: DataTypes.INTEGER,
    history: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'pengadaan'
  })
  return pengadaan
}
