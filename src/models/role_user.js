'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class role_user extends Model { // eslint-disable-line
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      role_user.hasOne(models.role, {
        foreignKey: 'nomor',
        as: 'detail_role',
        sourceKey: 'id_role'
      })
      role_user.hasOne(models.user, {
        foreignKey: 'username',
        as: 'detail_user',
        sourceKey: 'username'
      })
    }
  };
  role_user.init({
    username: DataTypes.STRING,
    id_role: DataTypes.INTEGER,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'role_user'
  })
  return role_user // eslint-disable-line
}
