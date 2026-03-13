const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {

    username: {
        type: DataTypes.STRING,
        unique: true
    },

    email: {
        type: DataTypes.STRING,
        unique: true
    },

    date_of_birth: {
        type: DataTypes.DATEONLY
    },

    age: {
        type: DataTypes.INTEGER
    },

    password: {
        type: DataTypes.STRING
    }

});

module.exports = User;
