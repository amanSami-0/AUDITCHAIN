const { Sequelize } = require("sequelize")

let sequelize

function initDatabase() {

    sequelize = new Sequelize({
        dialect: "sqlite",
        storage: "audit.db",
        logging:false
    })

    return sequelize
}

function getDB(){
    return sequelize
}

module.exports = {initDatabase,getDB}
