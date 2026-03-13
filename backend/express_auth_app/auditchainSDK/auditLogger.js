const generateHash = require("./hash")
const AuditLogModel = require("./models/AuditLog")

let AuditLog

async function init(sequelize){

    AuditLog = AuditLogModel()

    await sequelize.sync()
}

async function log({userId,action,attribute,req}){

    const last = await AuditLog.findOne({
        order:[["id","DESC"]]
    })

    const previousHash = last ? last.current_hash : "0"

    const timestamp = new Date().toISOString()

    const data = JSON.stringify({
        userId,
        action,
        attribute,
        timestamp,
        previousHash
    })

    const currentHash = generateHash(data)

    await AuditLog.create({

        user_id:userId,

        action,

        attribute_name:attribute,

        ip_address:req.ip,

        user_agent:req.headers["user-agent"],

        previous_hash:previousHash,

        current_hash:currentHash
    })
}

module.exports = {init,log}
