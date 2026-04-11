const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {

    return sequelize.define("LoginAttempt", {

        email: DataTypes.STRING,

        ip_address: DataTypes.STRING,

        user_agent: DataTypes.STRING,

        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },

        last_attempt: DataTypes.DATE,

        blocked_until: {
            type: DataTypes.DATE,
            allowNull: true
        }
    })
}
