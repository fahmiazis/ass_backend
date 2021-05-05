'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  };
  user.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    user_level: DataTypes.INTEGER,
    status: DataTypes.ENUM('active', 'inactive')
  }, {
    sequelize,
    modelName: 'user'
  })
  return user
}
