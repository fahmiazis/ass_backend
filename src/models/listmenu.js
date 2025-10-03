'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class listmenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  listmenu.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    kode_menu: DataTypes.STRING,
    timeline: DataTypes.INTEGER,
    jenis: DataTypes.STRING,
    status: DataTypes.STRING,
    access: DataTypes.STRING,
    routes: DataTypes.STRING,
    access_depo: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'listmenu',
  });
  return listmenu;
};