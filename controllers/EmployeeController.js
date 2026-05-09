const { Op } = require("sequelize");
const { Employee, EmploymentRecord, AuditLog, RecycleBin, TransferRequest } = require("../models");

class EmployeeController {
  static async list(req, res) {
    try {
      const { search } = req.query;
      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { zairo: { [Op.like]: `%${search}%` } },
          { nationality: { [Op.like]: `%${search}%` } },
        ];
      }
      const employees = await Employee.findAll({
        where,
        include: [{ model: EmploymentRecord, as: "records" }],
        order: [["id", "DESC"]],
      });
      return res.json({ data: employees });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async publicSearch(req, res) {
    try {
      const { q, type } = req.query;
      if (!q) return res.json({ data: [] });
      const where =
        type === "zairo"
          ? { zairo: { [Op.like]: `%${q}%` } }
          : { name: { [Op.like]: `%${q}%` } };
      const employees = await Employee.findAll({
        where,
        include: [
          {
            model: EmploymentRecord,
            as: "records",
            where: { approved: true },
            required: false,
          },
        ],
        attributes: ["id", "zairo", "name", "kana", "nationality", "visa", "photo"],
        limit: 50,
      });
      return res.json({ data: employees });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async detail(req, res) {
    try {
      const employee = await Employee.findByPk(req.params.id, {
        include: [{ model: EmploymentRecord, as: "records" }],
      });
      if (!employee) return res.status(404).json({ message: "Not found" });
      return res.json({ data: employee });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async create(req, res) {
    try {
      const photoFile = req.files?.photo?.[0];
      const photo = photoFile ? photoFile.filename : null;
      const { zairo, name, kana, dob, gender, nationality, visa, custom, records } = req.body;

      if (!zairo || !name) return res.status(400).json({ message: "Zairo and Name required" });

      const dup = await Employee.findOne({ where: { zairo } });
      if (dup) return res.status(409).json({ message: `Zairo Card used by ${dup.name}` });

      const customParsed = typeof custom === "string" ? JSON.parse(custom || "{}") : custom || {};
      const recordsParsed = typeof records === "string" ? JSON.parse(records || "[]") : records || [];

      const employee = await Employee.create({
        zairo,
        name,
        kana,
        dob,
        gender,
        nationality,
        visa,
        photo,
        custom: customParsed,
        createdBy: req.username,
      });

      const regular = recordsParsed.filter((r) => r.status !== "transfer");
      const transfers = recordsParsed.filter((r) => r.status === "transfer");

      for (const r of regular) {
        await EmploymentRecord.create({
          empId: employee.id,
          site: r.site,
          joining: r.joining,
          leaving: r.leaving,
          status: r.status,
          reason: r.reason,
          approved: false,
          requestedBy: req.username,
        });
      }
      for (const t of transfers) {
        await TransferRequest.create({
          empId: employee.id,
          fromSite: t.site,
          toSite: t.toSite,
          notes: t.reason,
          requestedBy: req.username,
          requestedAt: new Date(),
          status: "pending",
        });
      }

      await AuditLog.create({
        action: "create",
        detail: `Created record for ${name}`,
        user: req.username,
      });

      return res.status(201).json({ data: employee });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const employee = await Employee.findByPk(req.params.id);
      if (!employee) return res.status(404).json({ message: "Not found" });

      const photoFile = req.files?.photo?.[0];
      const { zairo, name, kana, dob, gender, nationality, visa, custom, records } = req.body;
      const customParsed = typeof custom === "string" ? JSON.parse(custom || "{}") : custom || employee.custom;
      const recordsParsed = typeof records === "string" ? JSON.parse(records || "[]") : records || [];

      await employee.update({
        zairo: zairo ?? employee.zairo,
        name: name ?? employee.name,
        kana: kana ?? employee.kana,
        dob: dob ?? employee.dob,
        gender: gender ?? employee.gender,
        nationality: nationality ?? employee.nationality,
        visa: visa ?? employee.visa,
        photo: photoFile ? photoFile.filename : employee.photo,
        custom: customParsed,
      });

      if (recordsParsed.length) {
        for (const r of recordsParsed) {
          if (r.status === "transfer") {
            await TransferRequest.create({
              empId: employee.id,
              fromSite: r.site,
              toSite: r.toSite,
              notes: r.reason,
              requestedBy: req.username,
              requestedAt: new Date(),
              status: "pending",
            });
          } else {
            const existing = await EmploymentRecord.findOne({
              where: { empId: employee.id, site: r.site, joining: r.joining },
            });
            if (existing) {
              await existing.update({
                leaving: r.leaving,
                status: r.status,
                reason: r.reason,
              });
            } else {
              await EmploymentRecord.create({
                empId: employee.id,
                site: r.site,
                joining: r.joining,
                leaving: r.leaving,
                status: r.status,
                reason: r.reason,
                approved: false,
                requestedBy: req.username,
              });
            }
          }
        }
      }

      await AuditLog.create({
        action: "edit",
        detail: `Updated record for ${employee.name}`,
        user: req.username,
      });

      return res.json({ data: employee });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  }

  static async remove(req, res) {
    try {
      const employee = await Employee.findByPk(req.params.id, {
        include: [{ model: EmploymentRecord, as: "records" }],
      });
      if (!employee) return res.status(404).json({ message: "Not found" });

      await RecycleBin.create({
        entityType: "employee",
        label: employee.name,
        payload: employee.toJSON(),
        deletedBy: req.username,
        deletedFrom: "records",
      });

      await EmploymentRecord.destroy({ where: { empId: employee.id } });
      await TransferRequest.destroy({ where: { empId: employee.id } });
      await employee.destroy();

      await AuditLog.create({
        action: "delete",
        detail: `Deleted: ${employee.name}`,
        user: req.username,
      });

      return res.status(204).end();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = EmployeeController;
