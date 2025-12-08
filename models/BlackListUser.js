const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

class BlackListUser extends Model {}

BlackListUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    card_no: DataTypes.STRING,
    full_name: DataTypes.STRING,
    name: DataTypes.STRING,
    dob: DataTypes.STRING,
    gender: DataTypes.STRING,
    nationality: DataTypes.STRING,
    visa_type: DataTypes.STRING,
    joining_date: DataTypes.STRING,
    current_site_name: DataTypes.STRING,
    leaving_date: DataTypes.STRING,
    leaving_reason: DataTypes.TEXT,
    employee_photo: DataTypes.TEXT,
    card_photo: DataTypes.TEXT,
  },
  { 
    sequelize,
    tableName: 'blacklistusers',   // 👈 force table name
  }
);

module.exports = BlackListUser;
