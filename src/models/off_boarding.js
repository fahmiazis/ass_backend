'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class off_boarding extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  off_boarding.init({
    company: DataTypes.STRING,
    department: DataTypes.STRING,
    direct_report: DataTypes.STRING,
    division: DataTypes.STRING,
    emp_email: DataTypes.STRING,
    employee: DataTypes.STRING,
    grade_id: DataTypes.STRING,
    job_title: DataTypes.STRING,
    last_day: DataTypes.STRING,
    location: DataTypes.STRING,
    office_mail: DataTypes.STRING,
    position: DataTypes.STRING,
    reason: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'off_boarding'
  })
  return off_boarding
}
