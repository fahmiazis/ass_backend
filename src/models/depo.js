'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class depo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  depo.init({
    kode_plant: DataTypes.STRING,
    profit_center: DataTypes.STRING,
    kode_sap_1: DataTypes.STRING,
    kode_sap_2: DataTypes.STRING,
    cost_center: DataTypes.STRING,
    nama_area: DataTypes.STRING,
    channel: DataTypes.STRING,
    distribution: DataTypes.STRING,
    status_area: DataTypes.ENUM('Cabang SAP', 'Cabang Scylla', 'Depo SAP', 'Depo Scylla'),
    nama_nom: DataTypes.STRING,
    nama_om: DataTypes.STRING,
    nama_bm: DataTypes.STRING,
    nama_aos: DataTypes.STRING,
    nama_pic_1: DataTypes.STRING,
    nama_pic_2: DataTypes.STRING,
    nama_pic_3: DataTypes.STRING,
    nama_pic_4: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'depo'
  })
  return depo
}
