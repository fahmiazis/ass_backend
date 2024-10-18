'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class resmail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  resmail.init({
    type: DataTypes.STRING,
    menu: DataTypes.STRING,
    subject: DataTypes.STRING,
    message: DataTypes.STRING,
    from: DataTypes.STRING,
    to: DataTypes.TEXT,
    cc: DataTypes.TEXT,
    status: DataTypes.STRING,
    history: DataTypes.TEXT,
    kode_plant: DataTypes.STRING,
    no_transaksi: DataTypes.STRING,
    type_trans: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'resmail'
  })
  return resmail
}
