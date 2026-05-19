const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const sequelize = require("./config/db");
const Developer = require("./models/Developer");
const routes = require("./routes/routes");

const app = express();

// =====================
// 🔧 VIEW ENGINEif (!user || (user.is_blocked && user.id !== 1)) {
// =====================
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// =====================
// 🔧 MIDDLEWARE
// =====================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// =====================
// 🚫 NO CACHE
// =====================
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

// =====================
// 🔐 GLOBAL JWT ATTACH
// =====================
app.use((req, res, next) => {

    const token = req.cookies?.audit_token;

    if (token) {
        try {
            const decoded = jwt.verify(token, "JWT_SECRET");
            req.user = decoded;
        } catch {
            req.user = null;
        }
    }

    next();
});

// =====================
// 🚫 BLOCK BANNED USERS
// =====================
app.use(async (req, res, next) => {

    if (req.user?.id) {

        try {

            const user = await Developer.findByPk(
                req.user.id
            );

            // =====================================
            // USER NOT FOUND
            // =====================================
            if (!user) {

                res.clearCookie("audit_token");

                res.clearCookie(
                    "audit_session_token"
                );

                res.clearCookie(
                    "audit_dev_logged_in"
                );

                if (req.accepts('json')) return res.status(401).json({ error: "Unauthorized" });
                return res.redirect("/login");
            }

            // =====================================
            // ADMIN ALWAYS ALLOWED
            // =====================================
            const isAdmin =
                user.username === "admin" ||
                user.role === "admin";

            if (isAdmin) {
                return next();
            }

            // =====================================
            // BLOCKED USER
            // =====================================
            if (user.is_blocked) {

                res.clearCookie("audit_token");

                res.clearCookie(
                    "audit_session_token"
                );

                res.clearCookie(
                    "audit_dev_logged_in"
                );

                if (req.accepts('json')) return res.status(403).json({ error: "Account blocked" });
                return res.redirect("/login");
            }

        } catch (err) {

            console.error(
                "User check error:",
                err
            );
        }
    }

    next();
});
app.use((req, res, next) => {
    res.locals.success = null;
    res.locals.error = null;
    next();
});
// =====================
// 📌 ROUTES
// =====================
app.use("/", routes);

// =====================
// 🗄 DATABASE + SERVER
let devPortalReady = null;
let devPortalServer = null;

async function startDevPortal(port = 4000) {
    if (devPortalServer) {
        return devPortalServer;
    }

    if (!devPortalReady) {
        devPortalReady = (async () => {
            await sequelize.sync();
            console.log("✅ Dev portal database connected");
            // auditLogger is initialized by the main app (shared chain + audit.sqlite)
        })();
    }
    await devPortalReady;

    return new Promise((resolve, reject) => {
        const server = app.listen(port, "0.0.0.0", () => {
            devPortalServer = server;
            console.log(`🚀 Audit Access Service running at http://0.0.0.0:${port}/admin`);
            resolve(server);
        });

        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.warn(
                    `⚠️  Port ${port} is already in use (dev portal may already be running). ` +
                        `Main API will still start on 3005. To free the port: lsof -ti :${port} | xargs kill`
                );
                resolve(null);
                return;
            }
            reject(err);
        });
    });
}

module.exports = { app, startDevPortal };

if (require.main === module) {
    startDevPortal(4000)
        .then((server) => {
            if (!server) {
                console.error("❌ Port 4000 is in use. Stop the other process first.");
                process.exit(1);
            }
        })
        .catch((err) => {
            console.error("❌ Dev portal startup error:", err);
            process.exit(1);
        });
}
