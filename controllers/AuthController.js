const User = require("../models/User");
const jwt = require("jsonwebtoken");
// const dotenv = require('dotenv');

// dotenv.config();

class AuthController {
  static async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
    try {
      const user = await User.findOne({ where: { username, password } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      let jwtSecretKey = process.env.JWT_SECRET_KEY;
      let data = {
        time: Date(),
        userId: user.id,
      };

      const token = jwt.sign(data, jwtSecretKey);

      return res.status(200).json({ token, message: "Login successful" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
module.exports = AuthController;
