const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;
const path = require("path");
const fs = require("fs").promises;

class Employee extends Model {}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    zairo: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    kana: DataTypes.STRING,
    dob: DataTypes.STRING,
    gender: DataTypes.STRING,
    nationality: DataTypes.STRING,
    visa: DataTypes.STRING,
    photo: DataTypes.STRING,
    custom: { type: DataTypes.JSON, defaultValue: {} },
    createdBy: DataTypes.STRING,
  },
  {
    sequelize,
    tableName: "employees",
  }
);

Employee.addHook("afterDestroy", async (instance) => {
  if (!instance.photo) return;
  const filePath = path.join(__dirname, "..", "uploads", instance.photo);
  try {
    await fs.unlink(filePath);
  } catch {}
});

module.exports = Employee;
