const UserModel = require("./User");
const BlackListUserModel = require("./BlackListUser");

// Initialize models with a Sequelize instance and DataTypes
function initModels(sequelize, DataTypes) {
  // If your model files export a function like (sequelize, DataTypes) => Model
  const User =
    typeof UserModel === "function"
      ? new UserModel(sequelize, DataTypes)
      : UserModel; // if already a model instance/class

  const BlackListUser =
    typeof BlackListUserModel === "function"
      ? new BlackListUserModel(sequelize, DataTypes)
      : BlackListUserModel;

  // define associations here if needed, e.g.:
  // User.hasMany(BlackListUser); BlackListUser.belongsTo(User);

  return { User, BlackListUser };
}

module.exports = initModels;
