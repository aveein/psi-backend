const bcrypt = require("bcryptjs");
const {
  User,
  Site,
  CustomField,
  AuditLog,
  RecycleBin,
  Permission,
  Employee,
  EmploymentRecord,
  TransferRequest,
} = require("../models");

class AdminController {
  // USERS
  static async listUsers(req, res) {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]],
    });
    res.json({ data: users });
  }

  static async createUser(req, res) {
    try {
      const { username, password, role, site } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      const dup = await User.findOne({ where: { username } });
      if (dup) return res.status(409).json({ message: "Username already exists" });
      const user = await User.create({
        username: String(username).toLowerCase(),
        password: bcrypt.hashSync(password, 10),
        role: role || "site",
        site: role === "site" ? site : null,
      });
      await AuditLog.create({
        action: "create",
        detail: `Created user: ${user.username}`,
        user: req.username,
      });
      const { password: _, ...safe } = user.toJSON();
      res.status(201).json({ data: safe });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: "Not found" });
      const { username, password, role, site } = req.body;
      const updates = {};
      if (username) updates.username = String(username).toLowerCase();
      if (password) updates.password = bcrypt.hashSync(password, 10);
      if (role) {
        updates.role = role;
        updates.site = role === "site" ? site : null;
      }
      await user.update(updates);
      await AuditLog.create({
        action: "edit",
        detail: `Edited user: ${user.username}`,
        user: req.username,
      });
      const { password: _, ...safe } = user.toJSON();
      res.json({ data: safe });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: "Not found" });
      if (user.username === "admin") {
        return res.status(403).json({ message: "Cannot delete admin" });
      }
      await user.destroy();
      await AuditLog.create({
        action: "delete",
        detail: `Deleted user: ${user.username}`,
        user: req.username,
      });
      res.status(204).end();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  // SITES
  static async listSites(req, res) {
    const sites = await Site.findAll({ order: [["name", "ASC"]] });
    res.json({ data: sites });
  }

  static async createSite(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name required" });
      const site = await Site.create({ name });
      res.status(201).json({ data: site });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateSite(req, res) {
    try {
      const site = await Site.findByPk(req.params.id);
      if (!site) return res.status(404).json({ message: "Not found" });
      await site.update({ name: req.body.name });
      res.json({ data: site });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteSite(req, res) {
    try {
      const site = await Site.findByPk(req.params.id);
      if (!site) return res.status(404).json({ message: "Not found" });
      await site.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // FIELDS
  static async listFields(req, res) {
    const fields = await CustomField.findAll({ order: [["id", "ASC"]] });
    res.json({ data: fields });
  }

  static async createField(req, res) {
    try {
      const { label, type, required, options, enabled } = req.body;
      if (!label) return res.status(400).json({ message: "Label required" });
      const field = await CustomField.create({
        label,
        type: type || "text",
        required: !!required,
        options,
        enabled: enabled !== false,
      });
      res.status(201).json({ data: field });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateField(req, res) {
    try {
      const field = await CustomField.findByPk(req.params.id);
      if (!field) return res.status(404).json({ message: "Not found" });
      await field.update(req.body);
      res.json({ data: field });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async deleteField(req, res) {
    try {
      const field = await CustomField.findByPk(req.params.id);
      if (!field) return res.status(404).json({ message: "Not found" });
      await field.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PERMISSIONS
  static async listPermissions(req, res) {
    const perms = await Permission.findAll();
    const result = {};
    perms.forEach((p) => {
      result[p.role] = p.perms;
    });
    res.json({ data: result });
  }

  static async updatePermission(req, res) {
    try {
      const { role } = req.params;
      const { perms } = req.body;
      const record = await Permission.findOne({ where: { role } });
      if (!record) return res.status(404).json({ message: "Not found" });
      await record.update({ perms });
      res.json({ data: record });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // LOGS
  static async listLogs(req, res) {
    const logs = await AuditLog.findAll({
      order: [["createdAt", "DESC"]],
      limit: 500,
    });
    res.json({ data: logs });
  }

  static async clearLogs(req, res) {
    await AuditLog.destroy({ where: {}, truncate: true });
    res.status(204).end();
  }

  // RECYCLE BIN
  static async listRecycle(req, res) {
    const items = await RecycleBin.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ data: items });
  }

  static async restoreRecycle(req, res) {
    try {
      const item = await RecycleBin.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });
      const payload = item.payload || {};
      delete payload.id;

      if (item.entityType === "employee") {
        await Employee.create(payload);
      } else if (item.entityType === "record") {
        await EmploymentRecord.create(payload);
      } else if (item.entityType === "user") {
        await User.create(payload);
      } else if (item.entityType === "field") {
        await CustomField.create(payload);
      } else if (item.entityType === "site") {
        await Site.create(payload);
      }

      await item.destroy();
      res.json({ message: "Restored" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }

  static async permaDelete(req, res) {
    try {
      const item = await RecycleBin.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: "Not found" });
      await item.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async emptyRecycle(req, res) {
    await RecycleBin.destroy({ where: {}, truncate: true });
    res.status(204).end();
  }

  // STATS
  static async stats(req, res) {
    try {
      const total = await Employee.count();
      const records = await EmploymentRecord.findAll({ where: { approved: true } });
      const transfers = await TransferRequest.count({ where: { status: "pending" } });
      const pendRecords = await EmploymentRecord.count({ where: { approved: false } });
      const sites = await Site.count();

      const counts = { resigned: 0, fired: 0, blacklisted: 0, transfer: 0 };
      records.forEach((r) => {
        if (counts[r.status] !== undefined) counts[r.status]++;
      });

      res.json({
        data: {
          total,
          ...counts,
          pending: pendRecords + transfers,
          pendingTransfers: transfers,
          sites,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = AdminController;
