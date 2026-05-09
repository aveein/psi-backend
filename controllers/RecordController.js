const { EmploymentRecord, Employee, AuditLog, RecycleBin } = require("../models");

class RecordController {
  static async listPending(req, res) {
    try {
      const records = await EmploymentRecord.findAll({
        where: { approved: false },
        include: [{ model: Employee, as: "employee" }],
        order: [["id", "DESC"]],
      });
      return res.json({ data: records });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async approve(req, res) {
    try {
      const record = await EmploymentRecord.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: "Not found" });
      await record.update({
        approved: true,
        approvedBy: req.username,
        approvedAt: new Date(),
      });
      await AuditLog.create({
        action: "approve",
        detail: `Approved ${record.status} record id=${record.id}`,
        user: req.username,
      });
      return res.json({ data: record });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async reject(req, res) {
    try {
      const record = await EmploymentRecord.findByPk(req.params.id);
      if (!record) return res.status(404).json({ message: "Not found" });
      await RecycleBin.create({
        entityType: "record",
        label: `${record.status} record`,
        payload: record.toJSON(),
        deletedBy: req.username,
        deletedFrom: "rejection",
      });
      await record.destroy();
      await AuditLog.create({
        action: "reject",
        detail: `Rejected record id=${req.params.id}`,
        user: req.username,
      });
      return res.status(204).end();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async approveAll(req, res) {
    try {
      const [count] = await EmploymentRecord.update(
        { approved: true, approvedBy: req.username, approvedAt: new Date() },
        { where: { approved: false } }
      );
      await AuditLog.create({
        action: "approve",
        detail: `Bulk approved ${count} pending records`,
        user: req.username,
      });
      return res.json({ count });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = RecordController;
