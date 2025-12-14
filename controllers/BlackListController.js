
const { Op } = require("sequelize");
const BlackListUser = require("../models/BlackListUser");

class BlackListController {
   
    static async getBlackList(req, res) {
        try {

            const search = req.query.search;

            const query = {
            order: [['createdAt', 'DESC']],
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
            if(blackList){
                return res.status(200).json({ data:blackList  });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    static async addToBlackList(req, res) {
        try {
            console.log(req.body)
            const blackList = BlackListUser.create(req.body);
            if(blackList){

                return res.status(201).json({ message: 'IP address added to blacklist successfully' });
            }
            // Logic to add the IP address to the blacklist
            // For example, save to database (pseudo code)
            // await BlackListModel.create({ ipAddress, reason });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    

}

module.exports = BlackListController;