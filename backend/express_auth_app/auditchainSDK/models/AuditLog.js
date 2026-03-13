const { DataTypes } = require("sequelize")
const { getDB } = require("../database")

function AuditLogModel(){

    const sequelize = getDB()

    return sequelize.define("AuditLog",{

        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },

        user_id:DataTypes.INTEGER,

        action:DataTypes.STRING,

        attribute_name:DataTypes.STRING,

        ip_address:DataTypes.STRING,

        user_agent:DataTypes.STRING,

        previous_hash:DataTypes.STRING,

        current_hash:DataTypes.STRING

    })
}

module.exports = AuditLogModel
