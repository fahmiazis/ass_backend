'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class docUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  docUser.init({
    nama_dokumen: DataTypes.STRING,
    jenis_dokumen: DataTypes.STRING,
    divisi: DataTypes.STRING,
    no_pengadaan: DataTypes.STRING,
    path: DataTypes.STRING,
    status: DataTypes.INTEGER,
    alasan: DataTypes.STRING,
    jenis_form: DataTypes.ENUM('disposal', 'pengadaan', 'stock')
  }, {
    sequelize,
    modelName: 'docUser'
  })
  return docUser
}
