const express = require("express");
const path = require("path");
const { Parser } = require("json2csv");
const axios = require("axios");
const crypto = require("crypto");
const { generateHash } =
    require("./hash");
let AuditLog;

const router = express.Router();

// =====================
// INIT MODEL
// =====================
async function initModel() {

    if (!AuditLog) {

        const sequelize = require("./database").initDatabase();

        AuditLog = require("./models/AuditLog")(sequelize);

        await AuditLog.sync();
    }
}

async function logDatabaseTamper(req) {

    try {

        const axios = require("axios");

        await axios.get(
            "http://localhost:4000/intruder-log",
            {
                headers: {
                    Cookie:
                        req.headers.cookie || ""
                },
                params: {
                    type: "DB_TAMPER"
                },
                withCredentials: true
            }
        );

        console.log(
            "🚨 DATABASE TAMPER LOGGED"
        );

    } catch (err) {

        console.log(
            "Tamper log failed:",
            err.message
        );
    }
}
// DASHBOARD
// =====================
router.get("/", async (req, res) => {

    await initModel();

    const { user_id } = req.query;

    let where = {};

    if (user_id && user_id.trim() !== "") {
        where.user_id = user_id;
    }

    const logs = await AuditLog.findAll({
        where,
        order: [["id", "DESC"]],
        limit: 100
    });

    res.render(path.join(__dirname, "views", "auditDashboard"), {
        logs,
        user_id
    });
});

// =====================
// EXPORT (FIXED JWT FLOW)
// =====================
router.get("/export", async (req, res) => {

    try {

        await initModel();

        const { user_id } = req.query;

        let where = {};

        if (user_id && user_id.trim() !== "") {
            where.user_id = user_id;
        }

        // =====================================
        // ✅ FETCH RAW LOGS
        // =====================================
        const logs = await AuditLog.findAll({
            where,
            order: [["id", "DESC"]],
            raw: true
        });

        console.log("EXPORT LOG COUNT:", logs.length);

        // =====================================
        // ✅ HANDLE EMPTY EXPORT
        // =====================================
        if (!logs || logs.length === 0) {

            return res.status(200).send(
                "No logs available to export"
            );
        }

        // =====================================
        // ✅ MANUAL CSV GENERATION
        // =====================================
        const headers = Object.keys(logs[0]);

        let csv = headers.join(",") + "\n";

        logs.forEach(log => {

            const row = headers.map(header => {

                let value = log[header];

                if (value === null || value === undefined) {
                    value = "";
                }

                value = String(value)
                    .replace(/"/g, '""')
                    .replace(/\n/g, " ");

                return `"${value}"`;
            });

            csv += row.join(",") + "\n";
        });

        // =====================================
        // ✅ TRACK EXPORT
        // =====================================
        axios.get("http://localhost:4000/export-log", {
            headers: {
                Cookie: req.headers.cookie || ""
            },
            withCredentials: true
        }).catch(() => {

            console.log("Export tracking failed");
        });

        // =====================================
        // ✅ FORCE CSV DOWNLOAD
        // =====================================
        res.setHeader(
            "Content-Type",
            "text/csv"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=audit_logs.csv"
        );

        return res.status(200).send(csv);

    } catch (err) {

        console.error("EXPORT ERROR:", err);

        return res.status(500).send(
            "Export failed"
        );
    }
});

// =====================
// VERIFY (LOCAL CHAIN CHECK)
// =====================
router.get("/verify", async (req, res) => {

    try {

        await initModel();

        // =====================================
        // TRACK VERIFY ATTEMPT
        // =====================================
        try {

            await axios.get(
                "http://localhost:4000/verify-log",
                {
                    headers: {
                        Cookie:
                            req.headers.cookie || ""
                    },
                    withCredentials: true
                }
            );

            console.log(
                "✅ VERIFY TRACKED"
            );

        } catch (err) {

            console.log(
                "VERIFY TRACK ERROR:",
                err.message
            );
        }

        // =====================================
        // FETCH LOGS
        // =====================================
        const logs = await AuditLog.findAll({
            order: [["id", "ASC"]]
        });

        // =====================================
        // VERIFY EACH LOG
        // =====================================
        for (let i = 0; i < logs.length; i++) {

            // =====================================
            // RECALCULATE HASH
            // =====================================
const logObject =
    logs[i].toJSON();

delete logObject.current_hash;

const recalculatedHash =
    generateHash(logObject);

            // =====================================
            // RECORD HASH CHECK
            // =====================================
            if (
                recalculatedHash !==
                logs[i].current_hash
            ) {

                console.log(
                    "🚨 RECORD HASH TAMPERING DETECTED"
                );
                try {

    await axios.get(
        "http://localhost:4000/intruder-log",
        {
            headers: {
                Cookie:
                    req.headers.cookie || ""
            },
            params: {
                type: "DB_TAMPER"
            },
            withCredentials: true
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

                return res.json({
                    valid: false,
                    error:
                        `Hash tampering at ID ${logs[i].id}`
                });
            }

            // =====================================
            // CHAIN LINK CHECK
            // =====================================
           if (

              i > 0 &&

             logs[i].previous_hash !==
             logs[i - 1].current_hash

               ) {

                console.log(
                    "🚨 DATABASE CHAIN TAMPERING DETECTED"
                );

                try {

                    await axios.get(
                        "http://localhost:4000/intruder-log",
                        {
                            headers: {
                                Cookie:
                                    req.headers.cookie || ""
                            },
                            params: {
                                type: "DB_TAMPER"
                            },
                            withCredentials: true
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

                return res.json({
                    valid: false,
                    error:
                        `Chain tampering at ID ${logs[i].id}`
                });
            }
        }

        // =====================================
        // VALID CHAIN
        // =====================================
        return res.json({
            valid: true
        });

    } catch (err) {

        console.log(
            "VERIFY ROUTE ERROR:",
            err.message
        );

        return res.json({
            valid: false,
            error: "Verification failed"
        });
    }
});
// =====================
// LOGOUT (JWT BASED)
// =====================
router.get("/logout", async (req, res) => {

    try {

        console.log("LOGOUT ROUTE HIT (3000)");

        // ✅ sync logout with auth service
        await axios.get("http://localhost:4000/logout", {
            headers: {
                Cookie: req.headers.cookie || ""
            },
            withCredentials: true
        });

    } catch (err) {

        console.log("Logout sync failed");
    }

    // ✅ destroy verification session
    req.session.destroy(() => {

        res.redirect("http://localhost:4000/login");
    });
});

module.exports = router;
