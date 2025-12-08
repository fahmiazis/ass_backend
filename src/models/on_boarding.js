'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class on_boarding extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  on_boarding.init({
    business_title: DataTypes.STRING,
    company: DataTypes.STRING,
    department: DataTypes.STRING,
    division: DataTypes.STRING,
    emp_email: DataTypes.STRING,
    grade_id: DataTypes.STRING,
    job_title: DataTypes.STRING,
    join_date: DataTypes.STRING,
    location: DataTypes.STRING,
    mpn_number: DataTypes.STRING,
    office_mail: DataTypes.STRING,
    position: DataTypes.STRING,
    qty_new: DataTypes.STRING,
    qty_replacement: DataTypes.STRING,
    requestor: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'on_boarding'
  })
  return on_boarding
}
