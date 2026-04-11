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

        // ✅ FIX: use absolute path
        res.render(
            path.join(__dirname, "views", "auditDashboard.ejs"),
            { logs }
        )
    })

    return router
}
