const bcrypt = require("bcryptjs");
const Developer = require("../models/Developer");
const AccessLog = require("../models/AccessLog");


// =====================
// LOGIN (AUTO REDIRECT)
// =====================
exports.login = async (req, res) => {

    try {

        const { username, password } = req.body;

        const ip = req.ip;
        const device = req.headers["user-agent"];

        const user = await Developer.findOne({ where: { username } });

        if (!user) return res.redirect("/login");

        // 🚫 BLOCK CHECK
        if (user.is_blocked) {
            return res.send("🚫 Permanently blocked by admin");
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {

            user.attempts += 1;

            if (user.attempts >= 3) {
                user.is_blocked = true;
            }

            await user.save();

            return res.redirect("/login");
        }

        // ✅ SUCCESS
        user.attempts = 0;
        await user.save();

        // 🔐 SESSION (ONLY THIS MATTERS NOW)
        req.session.dev = user.id;

        // ❌ REMOVE OLD COOKIE SYSTEM
        // res.cookie("audit_dev_logged_in", true);

        await AccessLog.create({
            developer_id: user.id,
            session_id: req.sessionID,
            ip_address: ip,
            device,
            login_time: new Date()
        });

        //  AUTO REDIRECT TO MAIN APP
        req.session.dev = user.id;
        res.redirect("http://localhost:3000/audit");

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.redirect("/login");
    }
};



// =====================
// LOGOUT (FULL DESTROY)
// =====================
exports.logout = async (req, res) => {

    try {

        const userId = req.session.dev;

        if (userId) {
            await AccessLog.update(
                { logout_time: new Date() },
                {
                    where: {
                        developer_id: userId,
                        logout_time: null
                    }
                }
            );
        }

        // 🔥 DESTROY SESSION COMPLETELY
        req.session.destroy((err) => {
            if (err) console.log(err);
        });

        res.redirect("/login");

    } catch (err) {
        console.error("LOGOUT ERROR:", err);
        res.redirect("/login");
    }
};



// =====================
// PROTECT
// =====================
exports.protect = (req, res, next) => {

    if (!req.session.dev) {
        return res.redirect("/login");
    }

    next();
};



// =====================
// ADMIN PANEL
// =====================
exports.admin = async (req, res) => {

    const users = await Developer.findAll();

    res.render("admin", { users });
};



// =====================
// REGISTER
// =====================
exports.register = async (req, res) => {

    const { username, email, dob, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await Developer.create({
        username,
        email,
        dob,
        password: hash
    });

    res.redirect("/admin");
};



// =====================
// UNBLOCK
// =====================
exports.unblock = async (req, res) => {

    const user = await Developer.findByPk(req.params.id);

    if (user) {
        user.is_blocked = false;
        user.attempts = 0;
        await user.save();
    }

    res.redirect("/admin");
};



// =====================
// ACCESS LOGS (FILTER)
// =====================
exports.accessLogs = async (req, res) => {

    const { developer_id } = req.query;

    let logs = [];
    let error = null;

    if (developer_id) {

        const user = await Developer.findByPk(developer_id);

        if (!user) {
            error = "User does not exist";
        } else {
            logs = await AccessLog.findAll({
                where: { developer_id },
                order: [["id", "DESC"]]
            });
        }

    } else {
        logs = await AccessLog.findAll({
            order: [["id", "DESC"]]
        });
    }

    const users = await Developer.findAll();

    const userMap = {};
    users.forEach(u => userMap[u.id] = u.username);

    res.render("accessLogs", {
        logs,
        userMap,
        error,
        developer_id
    });
};



// =====================
// KICK USER (REAL FIX)
// =====================
exports.kickUser = async (req, res) => {

    const { sessionId } = req.params;

    await AccessLog.update(
        { logout_time: new Date() },
        {
            where: {
                session_id: sessionId,
                logout_time: null
            }
        }
    );

    // 🔥 DESTROY THAT SESSION
    req.sessionStore.destroy(sessionId, (err) => {
        if (err) console.log(err);
    });

    res.redirect("/access-logs");
};


// =====================
// DELETE DEVELOPER
// =====================
exports.deleteDeveloper = async (req, res) => {

    try {

        const user = await Developer.findByPk(req.params.id);

        if (!user) {
            return res.redirect("/admin");
        }

        // 🔥 OPTIONAL: delete all access logs of this developer
        await AccessLog.destroy({
            where: { developer_id: user.id }
        });

        // 🔥 delete developer
        await user.destroy();

        res.redirect("/admin");

    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.redirect("/admin");
    }
};
// =====================
// VERIFY SESSION (FOR MAIN APP)
// =====================
exports.verifySession = (req, res) => {

    if (!req.session.dev) {
        return res.json({ valid: false });
    }

    res.json({
        valid: true,
        developer_id: req.session.dev
    });
};
