const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Developer = sequelize.define("Developer", {

    username: {
        type: DataTypes.STRING,
        unique: true
    },

    email: DataTypes.STRING,

    dob: DataTypes.DATEONLY,

    password: DataTypes.STRING,

    attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

});

module.exports = Developer;
