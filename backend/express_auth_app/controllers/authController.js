const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, verifyPassword } = require("../utils/password");

exports.signup = async (req, res) => {
    try {
        const { username, email, date_of_birth, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hash = await hashPassword(password);

        const dob = new Date(date_of_birth);
        const age = new Date().getFullYear() - dob.getFullYear();

        await User.create({
            username,
            email,
            date_of_birth,
            age,
            password: hash
        });

        res.status(201).json({ message: "Account created" });
    } catch (error) {
        res.status(500).json({ error: "Failed to create account" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        const valid = await verifyPassword(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        const token = jwt.sign(
            { id: user.id },
            "JWT_SECRET",
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });

        res.json({ message: "Logged in successfully", user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
};

exports.profile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

exports.update = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.update(req.body);

        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.destroy();
        res.clearCookie("token");

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete account" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.password = await hashPassword(password);

        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update password" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};

exports.updateSettings = async (req, res) => {
    try {
        // Mocks a successful configuration update. The Audit SDK middleware
        // will automatically intercept this request and log the body attributes.
        res.json({ message: "System configuration updated successfully", settings: req.body });
    } catch (error) {
        res.status(500).json({ error: "Failed to update configuration" });
    }
};
