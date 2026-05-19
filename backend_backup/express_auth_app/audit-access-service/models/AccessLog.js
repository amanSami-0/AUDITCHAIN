const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AccessLog = sequelize.define("AccessLog", {

    developer_id: {
        type: DataTypes.INTEGER,
        allowNull: true   // 🔥 needed for intruder
    },

    session_id: DataTypes.STRING,

    ip_address: {
        type: DataTypes.STRING,
        allowNull: true
    },

    device: {
        type: DataTypes.STRING,
        allowNull: true
    },

    location: {
        type: DataTypes.STRING,
        allowNull: true
    },

    login_time: DataTypes.DATE,
    logout_time: DataTypes.DATE
});

module.exports = AccessLog;
