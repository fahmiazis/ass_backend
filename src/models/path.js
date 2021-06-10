'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class path extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  path.init({
    dokumen: DataTypes.STRING,
    no_doc: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    path: DataTypes.STRING,
    status: DataTypes.INTEGER,
    alasan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'path'
  })
  return path
}
