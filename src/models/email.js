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
    email_area: DataTypes.STRING,
    email_staff_purch: DataTypes.STRING,
    email_spv_purch: DataTypes.STRING,
    email_manager_purch: DataTypes.STRING,
    email_am: DataTypes.STRING,
    email_aam: DataTypes.STRING,
    email_ga_spv: DataTypes.STRING,
    email_staff_ga: DataTypes.STRING,
    email_it_spv: DataTypes.STRING,
    email_ism: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'email'
  })
  return email
}
