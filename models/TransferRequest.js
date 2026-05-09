const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;

class TransferRequest extends Model {}

TransferRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empId: { type: DataTypes.INTEGER, allowNull: false },
    fromSite: DataTypes.STRING,
    toSite: DataTypes.STRING,
    notes: DataTypes.TEXT,
    requestedBy: DataTypes.STRING,
    requestedAt: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    resolvedBy: DataTypes.STRING,
    resolvedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: "transfer_requests",
  }
);

module.exports = TransferRequest;
