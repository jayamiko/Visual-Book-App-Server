'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init({
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.STRING,
    gender: DataTypes.STRING,
    phone: DataTypes.STRING,
    city: DataTypes.STRING,
    avatar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};