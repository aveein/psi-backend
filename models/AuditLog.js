const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;

class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    action: { type: DataTypes.STRING, allowNull: false },
    detail: DataTypes.TEXT,
    user: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "audit_logs",
  }
);

module.exports = AuditLog;
