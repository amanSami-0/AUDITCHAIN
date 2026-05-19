const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, verifyPassword } = require("../utils/password");

const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const LoginAttempt = sequelize.define("LoginAttempt", {
    email: DataTypes.STRING,
    ip_address: DataTypes.STRING,
    device: DataTypes.STRING,
    attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_attempt: DataTypes.DATE,
    blocked_until: DataTypes.DATE
});


// =====================
// PAGES
// =====================

exports.loginPage = (req, res) => res.render("login");
exports.signupPage = (req, res) => res.render("signup");
exports.deletePage = (req, res) => res.render("delete");
exports.forgotPage = (req, res) => res.render("forgot");

exports.profile = async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (req.accepts('json')) {
        res.json({ user });
    } else {
        res.render("profile", { user });
    }
};

exports.updatePage = async (req, res) => {
    const user = await User.findByPk(req.user.id);
    res.render("update", { user });
};


// =====================
// SIGNUP
// =====================

exports.signup = async (req, res) => {

    try {

        const { username, email, date_of_birth, password } = req.body;

        if (!username || !email || !password || !date_of_birth) {
            req.flash("error", "All fields required");
            if (req.accepts('json')) return res.status(400).json({ error: "All fields required" });
            return res.redirect("/signup");
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            req.flash("error", "Email already exists");
            if (req.accepts('json')) return res.status(400).json({ error: "Email already exists" });
            return res.redirect("/signup");
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            req.flash("error", "Username taken");
            if (req.accepts('json')) return res.status(400).json({ error: "Username taken" });
            return res.redirect("/signup");
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

        req.flash("success", "Account created");
        if (req.accepts('json')) return res.json({ success: true, message: "Account created" });
        res.redirect("/login");

    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        req.flash("error", "Something went wrong");
        if (req.accepts('json')) return res.status(500).json({ error: "Something went wrong" });
        res.redirect("/signup");
    }
};


// =====================
// LOGIN
// =====================

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket?.remoteAddress ||
            "UNKNOWN";

        // 🚫 VALIDATION
        if (!email || !password) {
            req.flash("error", "Missing credentials");
            if (req.accepts('json')) return res.status(400).json({ error: "Missing credentials" });
            return res.redirect("/login");
        }

        // 🚫 BLOCK CHECK
        const record = await LoginAttempt.findOne({
            where: { email, ip_address: ip }
        });

        if (record?.blocked_until && new Date() < record.blocked_until) {
            req.flash("error", "Account blocked. Try after 10 minutes.");
            if (req.accepts('json')) return res.status(403).json({ error: "Account blocked. Try after 10 minutes." });
            return res.redirect("/login");
        }

        const user = await User.findOne({ where: { email } });

        // ❌ USER NOT FOUND
        if (!user) {

            const result = await req.audit.trackLogin(email, false);

            if (result.blocked) {
                req.flash("error", "Too many attempts. Account blocked.");
                if (req.accepts('json')) return res.status(403).json({ error: "Too many attempts. Account blocked." });
                return res.redirect("/login");
            }

            req.flash("error", "User not found");
            if (req.accepts('json')) return res.status(401).json({ error: "User not found" });
            return res.redirect("/login");
        }

        // 🔐 PASSWORD CHECK
        const valid = await verifyPassword(password, user.password);

        if (!valid) {

            const result = await req.audit.trackLogin(email, false, user.id);

            if (result.blocked) {
                req.flash("error", "Too many attempts. Account blocked.");
                if (req.accepts('json')) return res.status(403).json({ error: "Too many attempts. Account blocked." });
                return res.redirect("/login");
            }

            req.flash("error", "Incorrect password");
            if (req.accepts('json')) return res.status(401).json({ error: "Incorrect password" });
            return res.redirect("/login");
        }

        // ✅ SUCCESS LOGIN
        await req.audit.trackLogin(email, true, user.id);

        const token = jwt.sign(
            { id: user.id },
            "JWT_SECRET",
            { expiresIn: "1h" }
        );

        res.cookie("auth_token", token);
        if (req.accepts('json')) return res.json({ success: true, token });

        res.redirect("/profile");

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        req.flash("error", "Something went wrong");
        if (req.accepts('json')) return res.status(500).json({ error: "Something went wrong" });
        res.redirect("/login");
    }
};


// =====================
// UPDATE
// =====================

exports.update = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    await user.update(req.body);

    await req.audit.logAction("UPDATE_PROFILE", user.id);

    req.flash("success", "Profile updated");
    if (req.accepts('json')) return res.json({ success: true, message: "Profile updated" });
    res.redirect("/profile");
};


// =====================
// SETTINGS
// =====================

exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        
        // Settings are not currently stored in the DB columns,
        // but we log the attempt to the ledger.
        const settingKeys = Object.keys(req.body);
        const attributeName = settingKeys.length > 0 ? settingKeys[0] : "settings";
        
        // Optional: Update user model if you add setting columns later
        // await user.update(req.body);

        await req.audit.logAction("UPDATE_SETTINGS", user.id);

        if (req.accepts('json')) return res.json({ success: true, message: "Settings updated" });
        res.redirect("/profile");
    } catch (err) {
        console.error("SETTINGS UPDATE ERROR:", err);
        if (req.accepts('json')) return res.status(500).json({ error: "Failed to update settings" });
        res.redirect("/profile");
    }
};


// =====================
// DELETE
// =====================

exports.deleteAccount = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    await user.destroy();

    await req.audit.logAction("DELETE_ACCOUNT", user.id);

    res.clearCookie("auth_token");
    if (req.accepts('json')) return res.json({ success: true, message: "Account deleted" });

    res.redirect("/signup");
};


// =====================
// FORGOT PASSWORD
// =====================

exports.forgotPassword = async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        req.flash("error", "User not found");
        if (req.accepts('json')) return res.status(404).json({ error: "User not found" });
        return res.redirect("/forgot");
    }

    user.password = await hashPassword(password);
    await user.save();

    await req.audit.logAction("PASSWORD_RESET", user.id);

    req.flash("success", "Password updated");
    if (req.accepts('json')) return res.json({ success: true, message: "Password updated" });
    res.redirect("/login");
};


// =====================
// LOGOUT (FIXED)
// =====================

exports.logout = async (req, res) => {

    try {

        if (req.user?.id) {
            await req.audit.logAction("LOGOUT", req.user.id);
        }

        res.clearCookie("auth_token");
        if (req.accepts('json')) return res.json({ success: true, message: "Logged out" });

        res.redirect("/login");

    } catch (err) {
        if (req.accepts('json')) return res.status(500).json({ error: "Logout failed" });
        res.redirect("/login");
    }
};
