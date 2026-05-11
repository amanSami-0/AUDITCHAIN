const express = require("express")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const path = require("path")
const axios = require("axios")
const fs = require("fs");
const crypto = require("crypto");
const { Op } = require("sequelize");
const { generateHash } =
    require("./auditchainSDK/hash");

const sequelize = require("./config/db")
const audit = require("./auditchainSDK")

require("./models/User")

const authRoutes = require("./routes/authRoutes")

const { authUser } = require("./middleware/authMiddleware")

const app = express()
// =====================================
// REALTIME DB TAMPER MONITOR
// =====================================

// =====================================
// REALTIME DB TAMPER MONITOR
// =====================================

let tamperAlreadyDetected = false;

function startRealtimeTamperMonitor() {

    // =====================================
    // USE ACTUAL AUDIT DATABASE
    // =====================================
    const dbPath = path.join(
        __dirname,
        "audit.sqlite"
    );

    console.log(
        "🛡️ Realtime DB monitor started"
    );

    console.log(
        "WATCHING DB:",
        dbPath
    );

    // =====================================
    // VERIFY DEBOUNCE
    // =====================================
    let verifyTimeout = null;

    // =====================================
    // RELIABLE SQLITE WATCHER
    // =====================================
    fs.watchFile(

        dbPath,

        { interval: 1000 },

        () => {

            // =====================================
            // RESET TIMER ON EVERY WRITE
            // =====================================
            clearTimeout(verifyTimeout);

            // =====================================
            // WAIT FOR SQLITE WRITE COMPLETION
            // =====================================
            verifyTimeout = setTimeout(async () => {

                try {

                    // =====================================
                    // PREVENT DUPLICATE ENTRIES
                    // =====================================
                    if (tamperAlreadyDetected) {
                        return;
                    }

                    console.log(
                        "⚠️ DATABASE FILE CHANGED"
                    );

                    // =====================================
                    // FETCH LOGS
                    // =====================================
                    const sdkDatabase =
                        require("./auditchainSDK/database")
                            .initDatabase();

                    const AuditLog =
                        require("./auditchainSDK/models/AuditLog")(sdkDatabase);

                    const logs = await AuditLog.findAll({
                        order: [["id", "ASC"]]
                    });

                    // =====================================
                    // SKIP SMALL DATASETS
                    // =====================================
                    if (logs.length < 2) {
                        return;
                    }

                    // =====================================
                    // VERIFY LOGS
                    // =====================================
                    for (let i = 1; i < logs.length; i++) {

                        const logObject =
                            logs[i].toJSON();

                        delete logObject.current_hash;

                        const recalculatedHash =
                            generateHash(logObject);

                        // =====================================
                        // HASH TAMPERING DETECTED
                        // =====================================
                        if (
                            recalculatedHash !==
                            logs[i].current_hash
                        ) {

                            console.log(
                                "🚨 REALTIME DB TAMPERING DETECTED"
                            );

                            tamperAlreadyDetected = true;

                            try {

                                await axios.get(
                                    "http://localhost:4000/intruder-log",
                                    {
                                        params: {
                                            type: "DB_TAMPER"
                                        }
                                    }
                                );

                                console.log(
                                    "🚨 DB TAMPER LOGGED"
                                );

                            } catch (err) {

                                console.log(
                                    "DB TAMPER LOG ERROR:",
                                    err.message
                                );
                            }

                            return;
                        }

                        // =====================================
                        // CHAIN LINK TAMPERING
                        // =====================================
                        if (
                            logs[i].previous_hash !==
                            logs[i - 1].current_hash
                        ) {

                            console.log(
                                "🚨 CHAIN TAMPERING DETECTED"
                            );

                            tamperAlreadyDetected = true;

                            try {

                                await axios.get(
                                    "http://localhost:4000/intruder-log",
                                    {
                                        params: {
                                            type: "DB_TAMPER"
                                        }
                                    }
                                );

                                console.log(
                                    "🚨 DB TAMPER LOGGED"
                                );

                            } catch (err) {

                                console.log(
                                    "DB TAMPER LOG ERROR:",
                                    err.message
                                );
                            }

                            return;
                        }
                    }

                } catch (err) {

                    console.log(
                        "Realtime monitor error:",
                        err.message
                    );
                }

            }, 1500); // wait for SQLite write completion
        }
    );
}
app.set("trust proxy", true)

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))

// 🔥 STRONG CACHE CONTROL
app.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
    res.setHeader("Surrogate-Control", "no-store")
    next()
})

app.use(flash())

app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})


// =====================
// 🔐 FINAL HYBRID GUARD (FIXED)
// =====================
let lastVerifiedAt = 0;


async function auditAccessGuard(req, res, next) {

    try {

        // =====================================
        // MUST HAVE COOKIES
        // =====================================
        if (
            !req.cookies.token ||
            !req.cookies.audit_dev_logged_in
        ) {

            req.session.developerVerified = false;

            return res.redirect(
                "http://localhost:4000/login"
            );
        }

        // =====================================
        // ALWAYS VERIFY ACTIVE SESSION
        // =====================================
        const response = await axios.get(
            "http://localhost:4000/verify-session",
            {
                headers: {
                    Cookie: req.headers.cookie || ""
                },
                withCredentials: true,
                timeout: 5000
            }
        );

        // =====================================
        // SESSION INVALID
        // =====================================
        if (!response.data.valid) {

            req.session.developerVerified = false;

            res.clearCookie("token");

            res.clearCookie("audit_dev_logged_in");

            res.clearCookie("audit_session_token");

            return res.redirect(
                "http://localhost:4000/login"
            );
        }

        // =====================================
        // SESSION VALID
        // =====================================
        req.session.developerVerified = true;

        return next();

    } catch (err) {

        console.log(
            "VERIFY ERROR:",
            err.message
        );

        req.session.developerVerified = false;

        return res.redirect(
            "http://localhost:4000/login"
        );
    }
}
// 📤 EXPORT (FIXED WITH LOGGING)
// =====================

// =====================
// 🚀 START SERVER
// =====================
async function startServer() {

    try {

        await audit.init()

        app.use(authUser)
        app.use(audit.middleware())

        app.use("/", authRoutes)
        app.use("/audit", (req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
});

        app.use("/audit", auditAccessGuard, audit.dashboard)

        await sequelize.sync()
        startRealtimeTamperMonitor();

        console.log("✅ Database Connected")
        console.log("🚀 Server running at http://localhost:3000")

        app.listen(3000)

    } catch (err) {
        console.error("Startup Error:", err)
    }
}

startServer()
