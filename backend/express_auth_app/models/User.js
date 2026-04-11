const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {

    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },

    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },

    age: {
        type: DataTypes.INTEGER
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    }

});

module.exports = User;
