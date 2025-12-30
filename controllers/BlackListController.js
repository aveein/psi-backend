const { Op } = require("sequelize");
const BlackListUser = require("../models/BlackListUser");
class BlackListController {
  static async getBlackList(req, res) {
    try {
      const search = req.query.search;

      const query = {
        order: [["createdAt", "DESC"]],
      };

      // Add filter only if search param exists
      if (search) {
        query.where = {
          [Op.or]: [
            { full_name: { [Op.like]: `%${search}%` } },
            { card_no: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      const blackList = await BlackListUser.findAll(query);
      if (blackList) {
        return res.status(200).json({ data: blackList });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  static async addToBlackList(req, res) {
    try {
      const files = req.files || {};
      const employeePhoto =
        files.employee_photo && files.employee_photo[0]
          ? files.employee_photo[0].filename
          : null;
      const cardPhoto =
        files.card_photo && files.card_photo[0]
          ? files.card_photo[0].filename
          : null;

      res.send(req.body);
      const blackList = BlackListUser.create({
        ...req.body,
        employee_photo: employeePhoto,
        card_photo: cardPhoto,
      });
      if (blackList) {
        return res
          .status(201)
          .json({ message: "IP address added to blacklist successfully" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  }

  static async deleteBlackList(req, res) {
      const id = req.params.id;
      await BlackListUser.destroy({ where: { id }, individualHooks: true });
      return res.status(204).end();
    }
}

module.exports = BlackListController;
