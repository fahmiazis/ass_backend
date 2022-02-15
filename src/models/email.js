'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class email extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  email.init({
    kode_plant: DataTypes.STRING,
    email_area_aos: DataTypes.STRING,
    email_area_om: DataTypes.STRING,
    email_staff_purch: DataTypes.STRING,
    email_spv_purch_1: DataTypes.STRING,
    email_spv_purch_2: DataTypes.STRING,
    email_manager_purch: DataTypes.STRING,
    email_spv_asset: DataTypes.STRING,
    email_am: DataTypes.STRING,
    email_aam: DataTypes.STRING,
    email_ga_spv: DataTypes.STRING,
    email_staff_ga: DataTypes.STRING,
    email_it_spv: DataTypes.STRING,
    email_ism: DataTypes.STRING,
    email_staff_asset1: DataTypes.STRING,
    email_staff_asset2: DataTypes.STRING,
    email_nom: DataTypes.STRING,
    email_bm: DataTypes.STRING,
    email_spv_tax: DataTypes.STRING,
    email_fm: DataTypes.STRING,
    email_afm: DataTypes.STRING,
    email_staff_it: DataTypes.STRING,
    email_staff_tax: DataTypes.STRING,
    email_spv_finance: DataTypes.STRING,
    email_staff_admbank: DataTypes.STRING,
    email_asman: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'email'
  })
  return email
}
