const express = require("express");

const router = express.Router();

const jwtVerify = require("../middleware/jwtVerify");

const controller = require("../controllers/controller");
console.log({
    login: typeof controller.login,
    logout: typeof controller.logout,
    admin: typeof controller.admin,
    accessLogs: typeof controller.accessLogs,
    viewDeveloperActivity: typeof controller.viewDeveloperActivity,
    register: typeof controller.register,
    banDeveloper: typeof controller.banDeveloper,
    unblock: typeof controller.unblock,
    updateDeveloper: typeof controller.updateDeveloper,
    deleteDeveloper: typeof controller.deleteDeveloper,
    kickUser: typeof controller.kickUser,
    verifySession: typeof controller.verifySession,
    exportLog: typeof controller.exportLog
});

// =====================
// AUTH
// =====================
router.get("/", (req, res) => {
    res.redirect("/login");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", controller.login);

router.get("/logout", controller.logout);

// =====================
// ADMIN
// =====================
router.get("/admin", controller.admin);

router.get("/access-logs", controller.accessLogs);

router.get(
    "/developer-activity/:id",
    controller.viewDeveloperActivity
);

router.post("/register", controller.register);

router.get("/ban/:id", controller.banDeveloper);

router.get("/unblock/:id", controller.unblock);

router.post("/update/:id", controller.updateDeveloper);

router.get("/delete/:id", controller.deleteDeveloper);

// =====================
// SESSION CONTROL
// =====================
router.get("/dashboard", jwtVerify, controller.dashboard);

router.get("/kick/:sessionId", controller.kickUser);

// =====================
// DEVELOPER PROTECTED
// =====================
router.get(
   "/verify-session",
   jwtVerify,
   controller.verifySession
);

router.get(
    "/export-log",
    jwtVerify,
    controller.exportLog
);

// =====================
// VERIFY LOG
// =====================
router.get("/verify-log", async (req, res) => {

    console.log("VERIFY LOG ROUTE HIT");

    try {

        const geoip = require("geoip-lite");

        const DeveloperActivity =
            require("../models/DeveloperActivity");

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

        console.log(
            "VERIFY LOG ERROR:",
            err.message
        );

        return res.json({
            success: true
        });
    }
});

router.get("/events", controller.events);

router.get(
    "/intruder-log",
    controller.logIntruder
);

module.exports = router;
