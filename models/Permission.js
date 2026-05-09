const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;

class Permission extends Model {}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("admin", "editor", "site"),
      allowNull: false,
      unique: true,
    },
    perms: { type: DataTypes.JSON, allowNull: false },
  },
  {
    sequelize,
    tableName: "permissions",
  }
);

module.exports = Permission;
