const User = require("./User");
const Employee = require("./Employee");
const EmploymentRecord = require("./EmploymentRecord");
const TransferRequest = require("./TransferRequest");
const Site = require("./Site");
const CustomField = require("./CustomField");
const AuditLog = require("./AuditLog");
const RecycleBin = require("./RecycleBin");
const Permission = require("./Permission");

Employee.hasMany(EmploymentRecord, { foreignKey: "empId", as: "records", onDelete: "CASCADE" });
EmploymentRecord.belongsTo(Employee, { foreignKey: "empId", as: "employee" });

Employee.hasMany(TransferRequest, { foreignKey: "empId", as: "transfers", onDelete: "CASCADE" });
TransferRequest.belongsTo(Employee, { foreignKey: "empId", as: "employee" });

module.exports = {
  User,
  Employee,
  EmploymentRecord,
  TransferRequest,
  Site,
  CustomField,
  AuditLog,
  RecycleBin,
  Permission,
};
