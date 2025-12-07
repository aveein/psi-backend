const {  DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

// Invalid
class User extends Model {
 
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize },
);

module.exports = User;