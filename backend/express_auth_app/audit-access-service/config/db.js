const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./audit_access.sqlite",
    logging: false
});

module.exports = sequelize;
