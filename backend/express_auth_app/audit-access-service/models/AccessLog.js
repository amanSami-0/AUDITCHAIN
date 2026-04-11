const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AccessLog = sequelize.define("AccessLog", {

    developer_id: DataTypes.INTEGER,

    session_id: DataTypes.STRING,   // ✅ NEW

    ip_address: DataTypes.STRING,

    device: DataTypes.STRING,

    login_time: DataTypes.DATE,

    logout_time: DataTypes.DATE
});

module.exports = AccessLog;
