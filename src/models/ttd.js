'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ttd extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  ttd.init({
    jabatan: DataTypes.STRING,
    jenis: DataTypes.ENUM('it', 'non-it', 'all'),
    sebagai: DataTypes.ENUM('pembuat', 'pemeriksa', 'penyetuju', 'penerima'),
    kategori: DataTypes.ENUM('budget', 'non-budget', 'return'),
    nama: DataTypes.STRING,
    path: DataTypes.STRING,
    no_doc: DataTypes.STRING,
    no_pengadaan: DataTypes.STRING,
    status: DataTypes.INTEGER,
    no_set: DataTypes.STRING,
    recent: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ttd'
  })
  return ttd
}
