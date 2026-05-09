const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, AuditLog } = require("../models");

class AuthController {
  static async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    try {
      const uname = String(username).trim().toLowerCase();
      const user = await User.findOne({ where: { username: uname } });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { userId: user.id, role: user.role, site: user.site, username: user.username },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      await AuditLog.create({
        action: "login",
        detail: `${user.username} signed in`,
        user: user.username,
      });

      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          site: user.site,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async me(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ["password"] },
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async logout(req, res) {
    if (req.userId && req.username) {
      await AuditLog.create({
        action: "logout",
        detail: `${req.username} signed out`,
        user: req.username,
      });
    }
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out" });
  }
}

module.exports = AuthController;
