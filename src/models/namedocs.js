'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class namedocs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  namedocs.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    menu: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'namedocs'
  })
  return namedocs
}
