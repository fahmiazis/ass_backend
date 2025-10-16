'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class apk extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  apk.init({
    name: DataTypes.STRING,
    versi: DataTypes.STRING,
    note_release: DataTypes.STRING,
    date_release: DataTypes.DATE,
    compatible: DataTypes.STRING,
    path: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'apk'
  })
  return apk
}
