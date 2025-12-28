const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db').sequelize;
const path = require("path");
const fs = require("fs").promises;
class BlackListUser extends Model {}

BlackListUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    card_no: DataTypes.STRING,
    full_name: DataTypes.STRING,
    name: DataTypes.STRING,
    dob: DataTypes.STRING,
    gender: DataTypes.STRING,
    nationality: DataTypes.STRING,
    visa_type: DataTypes.STRING,
    joining_date: DataTypes.STRING,
    current_site_name: DataTypes.STRING,
    leaving_date: DataTypes.STRING,
    leaving_reason: DataTypes.TEXT,
    employee_photo: DataTypes.TEXT,
    card_photo: DataTypes.TEXT,
  },
  { 
    sequelize,
    tableName: 'blacklistusers',   // 👈 force table name
  }
);
BlackListUser.addHook("afterDestroy", async (instance, options) => {
  const uploadsDir = path.join(__dirname, "..", "uploads");
  const filenames = [instance.employee_photo, instance.card_photo].filter(Boolean);
  
  if (!filenames.length) return;

  await Promise.all(
    filenames.map(async (name) => {
      const filePath = path.join(uploadsDir, name);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.log(`Failed to delete file ${filePath}:`, err);
        // ignore missing files or permission errors
      }
    })
  );
});
module.exports = BlackListUser;
