const { Sequelize } = require('sequelize');
require('dotenv').config()

class DBConnect{
    constructor(){
        this.sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
            host: process.env.DB_HOST,
            dialect: 'mysql'
        });
        
    }

    async authenticate(){
        try {
            await this.sequelize.authenticate();
            console.log('Connection has been established successfully.');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
        return this.sequelize;
    }
}

module.exports = new DBConnect();