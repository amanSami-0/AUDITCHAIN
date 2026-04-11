const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {

    return sequelize.define("AuditLog", {

        action: DataTypes.STRING,

        page: DataTypes.STRING,

        method: DataTypes.STRING,

        user_id: DataTypes.INTEGER,

        ip_address: DataTypes.STRING,

        device: DataTypes.STRING,

        status: DataTypes.STRING,

        attempt_count: DataTypes.INTEGER,

        visit_count: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },

        previous_hash: DataTypes.STRING,

        current_hash: DataTypes.STRING
    })
}
