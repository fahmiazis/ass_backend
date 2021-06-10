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
    status_doc: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'pengadaan'
  })
  return pengadaan
}
