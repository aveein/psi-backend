const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;

class EmploymentRecord extends Model {}

EmploymentRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empId: { type: DataTypes.INTEGER, allowNull: false },
    site: DataTypes.STRING,
    joining: DataTypes.STRING,
    leaving: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("resigned", "fired", "blacklisted", "transfer"),
      allowNull: false,
    },
    reason: DataTypes.TEXT,
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
    approvedBy: DataTypes.STRING,
    approvedAt: DataTypes.DATE,
    requestedBy: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "employment_records",
  }
);

module.exports = EmploymentRecord;
