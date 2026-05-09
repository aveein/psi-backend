const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db").sequelize;

class CustomField extends Model {}

CustomField.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    label: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.ENUM(
        "text",
        "number",
        "date",
        "email",
        "select",
        "textarea",
        "image",
        "file",
        "phone"
      ),
      defaultValue: "text",
    },
    options: DataTypes.STRING,
    required: { type: DataTypes.BOOLEAN, defaultValue: false },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: "custom_fields",
  }
);

module.exports = CustomField;
