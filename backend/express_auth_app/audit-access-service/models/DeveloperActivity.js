const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DeveloperActivity = sequelize.define("DeveloperActivity", {

    developer_id: DataTypes.INTEGER,

    action: DataTypes.STRING, // EXPORT_LOG / VERIFY_LOG / UNAUTHORIZED_INTRUDER

    ip_address: DataTypes.STRING,

    device: DataTypes.STRING,

    location: DataTypes.STRING,

    time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

});

module.exports = DeveloperActivity;
