const { DataTypes } = require("sequelize");
const sequelize = require("./db").sequelize; // <-- adjust path
const initModels = require("./models");
const User = require("./models/User");

console.log(sequelize)
initModels(sequelize, DataTypes);

(async () => {
  try {
    await sequelize.sync({ force: true }); // syncs all registered models
    const user = new User();
    user.username = "admin";
    user.password = "admin123";
    await user.save();
    console.log("All models synchronized.");
    process.exit(0);
  } catch (err) {
    console.error("Sync failed:", err);
    process.exit(1);
  }
})();
