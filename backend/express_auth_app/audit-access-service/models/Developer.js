const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Developer = sequelize.define("Developer", {

    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false
    },

    dob: DataTypes.DATEONLY,

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // 🔥 FIXED (comma above + proper placement)
    blocked_until: {
        type: DataTypes.DATE,
        allowNull: true
    }

});

module.exports = Developer;
