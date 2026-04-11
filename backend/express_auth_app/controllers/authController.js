const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, verifyPassword } = require("../utils/password");


// =====================
// PAGES
// =====================

exports.loginPage = (req, res) => res.json({ message: "Login endpoint" });
exports.signupPage = (req, res) => res.json({ message: "Signup endpoint" });
exports.deletePage = (req, res) => res.json({ message: "Delete endpoint" });
exports.forgotPage = (req, res) => res.json({ message: "Forgot endpoint" });

exports.profile = async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
    });
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
};

exports.updatePage = async (req, res) => {
    res.json({ message: "Update endpoint" });
};


// =====================
// SIGNUP
// =====================

exports.signup = async (req, res) => {

    try {

        const { username, email, date_of_birth, password } = req.body;

        if (!username || !email || !password || !date_of_birth) {
            return res.status(400).json({ error: "All fields required" });
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists" });
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            return res.status(400).json({ error: "Username taken" });
        }

        const hash = await hashPassword(password);

        const dob = new Date(date_of_birth);
        const age = new Date().getFullYear() - dob.getFullYear();

        const newUser = await User.create({
            username,
            email,
            date_of_birth: dob,
            age,
            password: hash
        });

        await req.audit.logAction("SIGNUP", newUser.id);

        res.status(201).json({ message: "Account created" });

    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};


// =====================
// LOGIN (FINAL SECURE)
// =====================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // 🔴 STEP 1: BLOCK CHECK FIRST
        const blockCheck = await req.audit.trackLogin(email, null);

        if (blockCheck.blocked) {
            return res.status(403).json({ error: "Account blocked. Try after 10 minutes." });
        }

        const user = await User.findOne({ where: { email } });

        // ❌ USER NOT FOUND
        if (!user) {

            const result = await req.audit.trackLogin(email, false);

            if (result.blocked) {
                return res.status(403).json({ error: "Too many attempts. Account blocked." });
            }

            return res.status(401).json({ error: "User not found" });
        }

        // ❌ WRONG PASSWORD
        const valid = await verifyPassword(password, user.password);

        if (!valid) {

            const result = await req.audit.trackLogin(email, false, user.id);

            if (result.blocked) {
                return res.status(403).json({ error: "Too many attempts. Account blocked." });
            }

            return res.status(401).json({ error: "Incorrect password" });
        }

        // 🔴 STEP 2: DOUBLE BLOCK CHECK
        const finalCheck = await req.audit.trackLogin(email, null, user.id);

        if (finalCheck.blocked) {
            return res.status(403).json({ error: "Account blocked. Try later." });
        }

        // ✅ SUCCESS LOGIN
        await req.audit.trackLogin(email, true, user.id);

        const token = jwt.sign(
            { id: user.id },
            "JWT_SECRET",
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true, sameSite: 'lax' });

        res.json({ message: "Logged in successfully", user: { id: user.id, username: user.username, email: user.email } });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};


// =====================
// UPDATE
// =====================

exports.update = async (req, res) => {

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    await user.update(req.body);

    await req.audit.logAction("UPDATE_PROFILE", user.id);

    res.json({ message: "Profile updated successfully" });
};


// =====================
// SETTINGS
// =====================

exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // We log the setting changes to the audit ledger
        const updates = Object.keys(req.body);
        
        for (const key of updates) {
            const value = req.body[key];
            const detailStr = `${key.toUpperCase().replace(/_/g, " ")}: ${value.toString().toUpperCase()}`;
            await req.audit.logAction("Updated Configuration", user.id, detailStr);
        }

        res.json({ message: "Settings updated successfully" });
    } catch (err) {
        console.error("SETTINGS ERROR:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};


// =====================
// DELETE
// =====================

exports.deleteAccount = async (req, res) => {

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    await req.audit.logAction("DELETE_ACCOUNT", user.id);

    res.clearCookie("token");

    res.json({ message: "Account deleted successfully" });
};


// =====================
// FORGOT PASSWORD
// =====================

exports.forgotPassword = async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    user.password = await hashPassword(password);
    await user.save();

    await req.audit.logAction("PASSWORD_RESET", user.id);

    res.json({ message: "Password updated successfully" });
};


// =====================
// LOGOUT
// =====================

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};
