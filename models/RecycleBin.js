const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;

class RecycleBin extends Model {}

RecycleBin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    entityType: {
      type: DataTypes.ENUM("employee", "record", "user", "field", "site"),
      allowNull: false,
    },
    label: DataTypes.STRING,
    payload: { type: DataTypes.JSON, allowNull: false },
    deletedBy: DataTypes.STRING,
    deletedFrom: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "recycle_bin",
  }
);

module.exports = RecycleBin;
