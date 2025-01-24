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
      user.hasOne(models.role, {
        foreignKey: 'nomor',
        as: 'role',
        sourceKey: 'user_level'
      })
    }
  };
  user.init({
    username: DataTypes.STRING,
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    kode_plant: DataTypes.STRING,
    user_level: DataTypes.INTEGER,
    status: DataTypes.ENUM('active', 'inactive'),
    status_it: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user'
  })
  return user
}
