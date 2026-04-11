const express = require("express")
const path = require("path")

let AuditLog

module.exports = (sequelize) => {

    const router = express.Router()

    if (!AuditLog) {
        AuditLog = require("./models/AuditLog")(sequelize)
    }

    router.get("/", async (req, res) => {

        const logs = await AuditLog.findAll({
            order: [["id", "DESC"]],
            limit: 100
        })

        // ✅ Return JSON instead of rendering EJS
        res.json({ logs });
    })

    // 🔥 REAL-TIME EVENTS (SSE)
    router.get("/events", (req, res) => {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const auditLogger = require("./auditLogger");
        
        const onNewLog = () => {
            res.write(`data: update\n\n`);
        };

        auditLogger.events.on("new_log", onNewLog);

        req.on("close", () => {
            auditLogger.events.removeListener("new_log", onNewLog);
        });
    })

    return router
}
