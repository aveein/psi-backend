const { TransferRequest, Employee, EmploymentRecord, AuditLog } = require("../models");

class TransferController {
  static async list(req, res) {
    try {
      const transfers = await TransferRequest.findAll({
        include: [{ model: Employee, as: "employee" }],
        order: [["id", "DESC"]],
      });
      return res.json({ data: transfers });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async create(req, res) {
    try {
      const { empId, fromSite, toSite, notes } = req.body;
      if (!empId || !toSite) {
        return res.status(400).json({ message: "Employee and destination site required" });
      }
      const employee = await Employee.findByPk(empId);
      if (!employee) return res.status(404).json({ message: "Employee not found" });

      const transfer = await TransferRequest.create({
        empId,
        fromSite,
        toSite,
        notes,
        requestedBy: req.username,
        requestedAt: new Date(),
        status: "pending",
      });

      await AuditLog.create({
        action: "transfer-req",
        detail: `Transfer: ${employee.name} → ${toSite}`,
        user: req.username,
      });

      return res.status(201).json({ data: transfer });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async approve(req, res) {
    try {
      const transfer = await TransferRequest.findByPk(req.params.id);
      if (!transfer) return res.status(404).json({ message: "Not found" });
      if (transfer.status !== "pending") {
        return res.status(409).json({ message: "Already resolved" });
      }
      await transfer.update({
        status: "approved",
        resolvedBy: req.username,
        resolvedAt: new Date(),
      });
      await EmploymentRecord.create({
        empId: transfer.empId,
        site: transfer.toSite,
        joining: new Date().toISOString().slice(0, 10),
        leaving: null,
        status: "transfer",
        reason: `Transferred from ${transfer.fromSite}`,
        approved: true,
        approvedBy: req.username,
        approvedAt: new Date(),
        requestedBy: transfer.requestedBy,
      });
      const employee = await Employee.findByPk(transfer.empId);
      await AuditLog.create({
        action: "approve",
        detail: `Transfer approved: ${employee?.name} → ${transfer.toSite}`,
        user: req.username,
      });
      return res.json({ data: transfer });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async reject(req, res) {
    try {
      const transfer = await TransferRequest.findByPk(req.params.id);
      if (!transfer) return res.status(404).json({ message: "Not found" });
      await transfer.update({
        status: "rejected",
        resolvedBy: req.username,
        resolvedAt: new Date(),
      });
      await AuditLog.create({
        action: "reject",
        detail: `Transfer rejected id=${req.params.id}`,
        user: req.username,
      });
      return res.json({ data: transfer });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = TransferController;
