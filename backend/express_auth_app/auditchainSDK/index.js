const {initDatabase} = require("./database")
const auditLogger = require("./auditLogger")
const middleware = require("./middleware")
const dashboard = require("./dashboard")

let sequelize

async function init(){

    sequelize = initDatabase()

    await auditLogger.init(sequelize)
}

module.exports = {

    init,

    middleware,

    dashboard,

    log:auditLogger.log
}
