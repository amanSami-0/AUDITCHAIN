const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, verifyPassword } = require("../utils/password");


// =====================
// PAGES
// =====================

exports.loginPage = (req, res) => res.render("login");
exports.signupPage = (req, res) => res.render("signup");
exports.deletePage = (req, res) => res.render("delete");
exports.forgotPage = (req, res) => res.render("forgot");

exports.profile = async (req, res) => {
    const user = await User.findByPk(req.user.id);
    res.render("profile", { user });
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
            return res.redirect("/signup");
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            req.flash("error", "Email already exists");
            return res.redirect("/signup");
        }

        const existingUsername = await User.findOne({ where: { username } });
        if (existingUsername) {
            req.flash("error", "Username taken");
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
        res.redirect("/login");

    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        req.flash("error", "Something went wrong");
        res.redirect("/signup");
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
            req.flash("error", "Account blocked. Try after 10 minutes.");
            return res.redirect("/login");
        }

        const user = await User.findOne({ where: { email } });

        // ❌ USER NOT FOUND
        if (!user) {

            const result = await req.audit.trackLogin(email, false);

            if (result.blocked) {
                req.flash("error", "Too many attempts. Account blocked.");
                return res.redirect("/login");
            }

            req.flash("error", "User not found");
            return res.redirect("/login");
        }

        // ❌ WRONG PASSWORD
        const valid = await verifyPassword(password, user.password);

        if (!valid) {

            const result = await req.audit.trackLogin(email, false, user.id);

            if (result.blocked) {
                req.flash("error", "Too many attempts. Account blocked.");
                return res.redirect("/login");
            }

            req.flash("error", "Incorrect password");
            return res.redirect("/login");
        }

        // 🔴 STEP 2: DOUBLE BLOCK CHECK
        const finalCheck = await req.audit.trackLogin(email, null, user.id);

        if (finalCheck.blocked) {
            req.flash("error", "Account blocked. Try later.");
            return res.redirect("/login");
        }

        // ✅ SUCCESS LOGIN
        await req.audit.trackLogin(email, true, user.id);

        const token = jwt.sign(
            { id: user.id },
            "JWT_SECRET",
            { expiresIn: "1h" }
        );

        res.cookie("token", token);

        res.redirect("/profile");

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        req.flash("error", "Something went wrong");
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
    res.redirect("/profile");
};


// =====================
// DELETE
// =====================

exports.deleteAccount = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    await user.destroy();

    await req.audit.logAction("DELETE_ACCOUNT", user.id);

    res.clearCookie("token");

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
        return res.redirect("/forgot");
    }

    user.password = await hashPassword(password);
    await user.save();

    await req.audit.logAction("PASSWORD_RESET", user.id);

    req.flash("success", "Password updated");
    res.redirect("/login");
};


// =====================
// LOGOUT
// =====================

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
};
