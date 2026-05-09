const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;

class Site extends Model {}

Site.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize,
    tableName: "sites",
  }
);

module.exports = Site;
