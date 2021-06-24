'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class approve extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  approve.init({
    nama_approve: DataTypes.STRING,
    nama: DataTypes.STRING,
    jabatan: DataTypes.STRING,
    jenis: DataTypes.ENUM('it', 'non-it', 'all'),
    sebagai: DataTypes.ENUM('pembuat', 'pemeriksa', 'penyetuju'),
    kategori: DataTypes.ENUM('budget', 'non-budget', 'return', 'all')
  }, {
    sequelize,
    modelName: 'approve'
  })
  return approve
}
