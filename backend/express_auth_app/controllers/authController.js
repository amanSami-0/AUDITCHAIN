const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { hashPassword, verifyPassword } = require("../utils/password");

exports.loginPage = (req, res) => {
    res.render("login");
};

exports.signupPage = (req, res) => {
    res.render("signup");
};

exports.signup = async (req, res) => {

    const { username, email, date_of_birth, password } = req.body;

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

    req.flash("success", "Account created");

    res.redirect("/login");
};

exports.login = async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/login");
    }

    const valid = await verifyPassword(password, user.password);

    if (!valid) {
        req.flash("error", "Incorrect password");
        return res.redirect("/login");
    }

    const token = jwt.sign(
        { id: user.id },
        "JWT_SECRET",
        { expiresIn: "1h" }
    );

    res.cookie("token", token);

    res.redirect("/profile");
};

exports.profile = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    res.render("profile", { user });
};

exports.updatePage = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    res.render("update", { user });
};

exports.update = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    await user.update(req.body);

    req.flash("success", "Profile updated");

    res.redirect("/profile");
};

exports.deletePage = (req, res) => {

    res.render("delete");
};

exports.deleteAccount = async (req, res) => {

    const user = await User.findByPk(req.user.id);

    await user.destroy();

    res.redirect("/signup");
};

exports.forgotPage = (req, res) => {

    res.render("forgot");
};

exports.forgotPassword = async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        req.flash("error", "User not found");
        return res.redirect("/forgot");
    }

    user.password = await hashPassword(password);

    await user.save();

    res.redirect("/login");
};

exports.logout = (req, res) => {

    res.clearCookie("token");

    res.redirect("/login");
};
