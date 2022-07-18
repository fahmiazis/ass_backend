'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class notif extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  notif.init({
    kode_plant: DataTypes.STRING,
    jenis: DataTypes.ENUM('disposal', 'mutasi', 'stock', 'pengadaan'),
    no_proses: DataTypes.STRING,
    list_appr: DataTypes.STRING,
    keterangan: DataTypes.STRING,
    response: DataTypes.ENUM('request', 'reject', 'full', 'revisi'),
    status: DataTypes.INTEGER,
    route: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'notif'
  })
  return notif
}
