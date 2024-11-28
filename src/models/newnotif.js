'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class newnotif extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  newnotif.init({
    user: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    transaksi: DataTypes.STRING,
    proses: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    no_pembayaran: DataTypes.STRING,
    tipe: DataTypes.STRING,
    keterangan: DataTypes.STRING,
    status: DataTypes.INTEGER,
    routes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'newnotif'
  })
  return newnotif
}
