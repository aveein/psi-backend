const {  DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;

// Invalid
class BlackListUser extends Model {
 
}

BlackListUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    card_no: {
      type: DataTypes.STRING,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    name:{
      type: DataTypes.STRING,
    },
    dob:{
      type: DataTypes.STRING,
    },
    gender:{
      type: DataTypes.STRING,
    },
     nationality:{
      type: DataTypes.STRING,
    },
     visa_type:{
      type: DataTypes.STRING,
    },
    joining_date:{
      type: DataTypes.STRING,
    },
     current_site_name:{
      type: DataTypes.STRING,
    },
    leaving_date:{
      type: DataTypes.STRING,
    },
    leaving_reason:{
      type: DataTypes.TEXT,
    },
    employee_photo:{
      type: DataTypes.TEXT,
    },
    card_photo:{
      type: DataTypes.TEXT,
    }

  },
  { sequelize },
);

module.exports = BlackListUser;