'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  document.init({
    nama_dokumen: DataTypes.STRING,
    jenis_dokumen: DataTypes.ENUM('it', 'non_it', 'all'),
    divisi: DataTypes.STRING,
    tipe_dokumen: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'document'
  })
  return document
}
