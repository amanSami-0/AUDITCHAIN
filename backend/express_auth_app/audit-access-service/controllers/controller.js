const bcrypt = require("bcryptjs");
const Developer = require("../models/Developer");
const AccessLog = require("../models/AccessLog");
const DeveloperActivity = require("../models/DeveloperActivity");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// SSE Clients
let clients = [];

const broadcastUpdate = () => {
    clients.forEach(client => client.res.write("data: update\n\n"));
};

// =====================
// REALTIME EVENTS (SSE)
// =====================
exports.events = (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    console.log(`[SSE] Client ${clientId} connected`);

    req.on("close", () => {
        clients = clients.filter(c => c.id !== clientId);
        console.log(`[SSE] Client ${clientId} disconnected`);
    });
};


// =====================
// LOGIN (FIXED)
// =====================
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Developer.findOne({ where: { username } });
        if (!user) {
            if (req.accepts('json')) return res.status(401).json({ error: "Invalid credentials" });
            return res.redirect("/login");
        }

        if (user.is_blocked) {
            if (req.accepts('json')) return res.status(403).json({ error: "Account blocked" });
            return res.send("🚫 Account blocked");
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            user.attempts += 1;
            if (user.attempts >= 3) user.is_blocked = true;
            await user.save();
            if (req.accepts('json')) return res.status(401).json({ error: "Invalid credentials" });
            return res.redirect("/login");
        }

        user.attempts = 0;
        await user.save();

        // 🔥 CREATE SESSION FIRST (IMPORTANT)
        const sessionToken = uuidv4();

        await AccessLog.create({
            developer_id: user.id,
            session_id: sessionToken,
            ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
            device: req.headers["user-agent"],
            login_time: new Date()
        });

        // 🔥 JWT
       const jwtToken = jwt.sign(
    { 
        id: user.id, 
        sessionId: sessionToken,
        loginTime: Date.now()   // 🔥 ADD THIS
    },
    "JWT_SECRET",
    { expiresIn: "1h" }
);

        // 🔥 SET COOKIES (CONSISTENT)
        res.cookie("audit_token", jwtToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        });

        res.cookie("audit_session_token", sessionToken, {
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        });

        res.cookie("audit_dev_logged_in", "true", {
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        });

        // 🔥 SMALL DELAY FIX (prevents race)
        if (req.accepts('json')) {
            return res.json({ success: true });
        }
        return res.redirect("http://localhost:3000/audit");

    } catch (err) {
        console.error(err);
        if (req.accepts('json')) return res.status(500).json({ error: "Server error" });
        res.redirect("/login");
    }
};
// REGISTER (ONLY ONE VERSION)
// =====================
exports.register = async (req, res) => {

    try {

        const { username, email, dob, password } = req.body;

        if (!username || !email || !dob || !password) {
            if (req.accepts('json')) return res.status(400).json({ error: "Missing fields" });
            return res.redirect("/admin");
        }

        const existing = await Developer.findOne({ where: { username } });

        if (existing) {
            if (req.accepts('json')) return res.status(400).json({ error: "Username taken" });
            return res.redirect("/admin");
        }

        const hash = await bcrypt.hash(password, 10);

        await Developer.create({
            username,
            email,
            dob,
            password: hash,
            attempts: 0,
            is_blocked: false
        });

        if (req.accepts('json')) return res.json({ success: true });
        res.redirect("/admin");

    } catch (err) {
        if (req.accepts('json')) return res.status(500).json({ error: "Server error" });
        res.redirect("/admin");
    }
};

// =====================
// LOGOUT
// =====================
exports.logout = async (req, res) => {

    try {

        const devId = req.user?.id;
        const sessionId = req.cookies.audit_session_token;

        if (devId && sessionId) {

            await AccessLog.update(
                { logout_time: new Date() },
                {
                    where: {
                        developer_id: devId,
                        session_id: sessionId
                    }
                }
            );
        }

        // 🔥 CLEAR ALL AUTH COOKIES
        res.clearCookie("audit_token", {
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        });

        res.clearCookie("audit_session_token", {
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        });

        res.clearCookie("audit_dev_logged_in", {
            httpOnly: true,
            sameSite: "lax",
            path: "/"
        });

        if (req.accepts('json')) return res.json({ success: true });
        return res.redirect("/login");

    } catch (err) {

        console.log("Logout error:", err.message);

        if (req.accepts('json')) return res.status(500).json({ error: "Server error" });
        return res.redirect("/login");
    }
};
// =====================
// ADMIN PAGE
// =====================
exports.admin = async (req, res) => {

    const users = await Developer.findAll({
        order: [["id", "ASC"]]
    });

    if (req.accepts('json')) {
        return res.json({ users });
    }

    res.render("admin", {
        users,
        success: null,
        error: null
    });
};
// =====================
// BAN
// =====================
exports.banDeveloper = async (req, res) => {

    const id = req.params.id;

    const user = await Developer.findByPk(id);

    if (user) {
        user.is_blocked = true;
        user.attempts = 0;
        await user.save();
    }

    await AccessLog.update(
        { logout_time: new Date() },
        {
            where: {
                developer_id: id,
                logout_time: null
            }
        }
    );

    if (req.accepts('json')) return res.json({ success: true });
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

    if (req.accepts('json')) return res.json({ success: true });
    res.redirect("/admin");
};


// =====================
// UPDATE
// =====================
exports.updateDeveloper = async (req, res) => {

    try {

        console.log("UPDATE BODY:", req.body);
        console.log("UPDATE ID:", req.params.id);

        const user = await Developer.findByPk(req.params.id);

        if (!user) {
            console.log("User not found");
            return res.redirect("/admin");
        }

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.dob = req.body.dob || user.dob;

        await user.save();

        if (req.accepts('json')) return res.json({ success: true });
        res.redirect("/admin");

    } catch (err) {
        console.error("Update error:", err);
        if (req.accepts('json')) return res.status(500).json({ error: "Server error" });
        res.redirect("/admin");
    }
};


// =====================
// DELETE
// =====================
exports.deleteDeveloper = async (req, res) => {

    const user = await Developer.findByPk(req.params.id);

    if (!user) return res.redirect("/admin");

    const developerId = user.id;

    // 🔥 LOGOUT ALL SESSIONS
    await AccessLog.update(
        { logout_time: new Date() },
        {
            where: {
                developer_id: developerId,
                logout_time: null
            }
        }
    );

    await AccessLog.destroy({ where: { developer_id: developerId } });
    await user.destroy();

    if (req.accepts('json')) return res.json({ success: true });
    res.redirect("/admin");
};

// =====================
// ACCESS LOGS
// =====================
exports.accessLogs = async (req, res) => {

    try {

        const { developer_id } = req.query;

        let where = {};

        // 🔍 FILTER (IF SEARCH USED)
        if (developer_id && developer_id.trim() !== "") {
            where.developer_id = developer_id;
        }

        const logs = await AccessLog.findAll({
            where,
            order: [["id", "DESC"]]
        });

        const users = await Developer.findAll();

        const userMap = {};
        users.forEach(u => userMap[u.id] = u.username);

        if (req.accepts('json')) {
            return res.json({ logs, userMap, developer_id: developer_id || "" });
        }

        res.render("accessLogs", {
            logs,
            userMap,
            developer_id: developer_id || "",
            success: null,
            error: null
        });
    } catch (err) {
        console.error(err);
        if (req.accepts('json')) {
            return res.json({ logs: [], userMap: {}, developer_id: "" });
        }
      res.render("accessLogs", {
            logs: [],
            userMap: {},
            developer_id: "",
            success: null,
            error: null
        });
    }
};

// =====================
// KICK
// =====================
exports.kickUser = async (req, res) => {

    try {

        const { sessionId } = req.params;
        const isSingle = req.query.single === "true";

        console.log("KICK SESSION:", sessionId);

        const log = await AccessLog.findOne({
            where: { session_id: sessionId }
        });

        if (!log) return res.redirect("/access-logs");

        const developerId = log.developer_id;

        // 🔥 NEW LOGIC (NO sessionStore)
        if (isSingle) {

            await AccessLog.update(
                { logout_time: new Date() },
                {
                    where: {
                        session_id: sessionId,
                        logout_time: null
                    }
                }
            );

        } else {

            await AccessLog.update(
                { logout_time: new Date() },
                {
                    where: {
                        developer_id: developerId,
                        logout_time: null
                    }
                }
            );
        }

        if (req.accepts('json')) return res.json({ success: true });
        res.redirect("/access-logs");

    } catch (err) {
        console.error("Kick error:", err);
        if (req.accepts('json')) return res.status(500).json({ error: "Server error" });
        res.redirect("/access-logs");
    }
};

// =====================
// VERIFY SESSION
// =====================
exports.verifyLog = async (req, res) => {

    console.log("VERIFY LOG ROUTE HIT");

    try {

        const geoip = require("geoip-lite");
        const DeveloperActivity = require("../models/DeveloperActivity");

        const devId = req.user?.id || null;

        const ip =
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "Unknown";

        const device =
            req.headers["user-agent"] ||
            "Unknown";

        let location = "Unknown";

        try {

            const geo = geoip.lookup(ip);

            location = geo
                ? `${geo.country}, ${geo.city || "Unknown"}`
                : "Unknown";

        } catch {}

        await DeveloperActivity.create({

            developer_id: devId,

            action: devId
                ? "VERIFY"
                : "INTRUDER_VERIFY",

            ip_address: ip,

            device,

            location,

            time: new Date()
        });

        console.log("✅ VERIFY TRACKED");

        return res.json({
            success: true
        });

    } catch (err) {

        console.log("VERIFY LOG ERROR:", err.message);

        return res.json({
            success: true
        });
    }
};
// =====================
// VIEW ACTIVITY
// =====================
exports.viewDeveloperActivity = async (req, res) => {

    const logs = await DeveloperActivity.findAll({
        where: { developer_id: req.params.id },
        order: [["time", "DESC"]]
    });

    if (req.accepts('json')) return res.json({ logs });

    res.render("developerActivity", { logs });
};


// =====================
// EXPORT TRACK
// =====================
exports.exportLog = async (req, res) => {

    try {

        const geoip = require("geoip-lite");
        const DeveloperActivity = require("../models/DeveloperActivity");

        // =====================================
        // ✅ OPTIONAL USER IDENTIFICATION
        // =====================================
        // detection system -> never block export
        // =====================================

        let devId = req.user?.id || null;

        // =====================================
        // ✅ SAFE IP
        // =====================================
        const ip =
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "Unknown";

        // =====================================
        // ✅ SAFE DEVICE
        // =====================================
        const device =
            req.headers["user-agent"] ||
            "Unknown";

        // =====================================
        // ✅ SAFE LOCATION
        // =====================================
        let location = "Unknown";

        try {

            const geo = geoip.lookup(ip);

            location = geo
                ? `${geo.country}, ${geo.city || "Unknown"}`
                : "Unknown";

        } catch {
            location = "Unknown";
        }

        // =====================================
        // ✅ DETECT ACTOR TYPE
        // =====================================
        let actionType = "EXPORT";

        if (!devId) {
            actionType = "INTRUDER_EXPORT";
        }

        console.log("EXPORT ACTOR:", devId || "INTRUDER");

        // =====================================
        // ✅ STORE ACTIVITY
        // =====================================
        await DeveloperActivity.create({

            developer_id: devId, // NULL for intruder

            action: actionType,

            ip_address: ip,

            device,

            location,

            time: new Date()
        });

        console.log("✅ EXPORT TRACKED");

        // =====================================
        // ✅ NEVER BLOCK EXPORT
        // =====================================
        return res.json({
            success: true
        });

    } catch (err) {

        console.error("Export log error:", err);

        // =====================================
        // ✅ DETECTION SYSTEM:
        // NEVER BLOCK EXPORT
        // =====================================
        return res.json({
            success: true
        });
    }
};
exports.verifySession = async (req, res) => {

    try {

        const AccessLog = require("../models/AccessLog");
        const Developer = require("../models/Developer");

        const devId = req.user?.id;

        const sessionId = req.user?.sessionId;

        if (!devId || !sessionId) {

            console.log("⚠️ VERIFY FAILED");

            return res.json({
                valid: false
            });
        }

        // =====================================
        // ACTIVE SESSION CHECK
        // =====================================
        const log = await AccessLog.findOne({

            where: {
                developer_id: devId,
                session_id: sessionId,
                logout_time: null
            }
        });

        if (!log) {

            console.log("⚠️ SESSION LOG NOT FOUND");

            return res.json({
                valid: false
            });
        }

        // =====================================
        // USER CHECK
        // =====================================
        const user = await Developer.findByPk(devId);

        if (!user || user.is_blocked) {

            console.log("⚠️ BLOCKED USER");

            return res.json({
                valid: false
            });
        }

        console.log("✅ VERIFY SUCCESS");

        return res.json({
            valid: true
        });

    } catch (err) {

        console.log(
            "VERIFY SESSION ERROR:",
            err.message
        );

        return res.json({
            valid: false
        });
    }
};
// =====================
// INTRUDER
// =====================
exports.logIntruder = async (req, res) => {

    try {
         // =====================================
// SKIP INTERNAL AXIOS REQUESTS
// =====================================


const userAgent =
    req.headers["user-agent"] || "";

if (
    userAgent.includes("axios") &&
    req.query.type !== "DB_TAMPER"
) {


    return res.json({
        success: true
    });
}
        // 🔥 SAFE FETCH (no crash)
        const ip =
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress ||
            "Unknown";

        const device =
            req.headers["user-agent"] ||
            "Unknown";

        let location = "Unknown";

        try {
            const geoip = require("geoip-lite");
            const geo = geoip.lookup(ip);
            location = geo
                ? `${geo.country}, ${geo.city || "Unknown"}`
                : "Unknown";
        } catch {
            location = "Unknown";
        }

        // 🔥 INSERT INTO ACCESS LOG
        await AccessLog.create({
            developer_id: null,
            session_id:
    (req.query.type || "INTRUDER")
    + "_" +
    Date.now(),// unique
            ip_address: ip,
            device,
            location,
            login_time: new Date(),
            logout_time: new Date()
        });

        // 🔥 TRIGGER FRONTEND REFRESH
        broadcastUpdate();

        res.json({ success: true });

    } catch (err) {
        console.error("Intruder log error:", err);
        res.json({ success: false });
    }
};

// =====================
// DASHBOARD
// =====================
exports.dashboard = async (req, res) => {
    if (req.accepts('json')) return res.json({ success: true });
    res.redirect("/admin");
};
