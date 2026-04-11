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

        if (!user) return res.status(401).json({ error: "User not found" });

        // 🚫 BLOCK CHECK
        if (user.is_blocked) {
            return res.status(403).json({ error: "Permanently blocked by admin" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {

            user.attempts += 1;

            if (user.attempts >= 3) {
                user.is_blocked = true;
            }

            await user.save();

            return res.status(401).json({ error: "Incorrect password" });
        }

        // ✅ SUCCESS
        user.attempts = 0;
        await user.save();

        // 🔐 SESSION (ONLY THIS MATTERS NOW)
        req.session.dev = user.id;

        await AccessLog.create({
            developer_id: user.id,
            session_id: req.sessionID,
            ip_address: ip,
            device,
            login_time: new Date()
        });

        res.json({ message: "Logged in successfully" });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ error: "Something went wrong" });
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

        res.json({ message: "Logged out successfully" });

    } catch (err) {
        console.error("LOGOUT ERROR:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};



// =====================
// PROTECT
// =====================
exports.protect = (req, res, next) => {

    if (!req.session.dev) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    next();
};



// =====================
// ADMIN PANEL
// =====================
exports.admin = async (req, res) => {

    const users = await Developer.findAll();

    res.json({ users });
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

    res.status(201).json({ message: "Developer registered" });
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

    res.json({ message: "Developer unblocked" });
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

    res.json({
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

    res.json({ message: "User kicked" });
};


// =====================
// DELETE DEVELOPER
// =====================
exports.deleteDeveloper = async (req, res) => {

    try {

        const user = await Developer.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "Developer not found" });
        }

        // 🔥 OPTIONAL: delete all access logs of this developer
        await AccessLog.destroy({
            where: { developer_id: user.id }
        });

        // 🔥 delete developer
        await user.destroy();

        res.json({ message: "Developer deleted" });

    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: "Something went wrong" });
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
