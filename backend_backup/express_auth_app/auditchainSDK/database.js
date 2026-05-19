const { Sequelize } = require("sequelize")

let sequelize

function initDatabase() {

    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: "./audit.sqlite",
        logging: false
    })

    return sequelize
}

module.exports = { initDatabase }
