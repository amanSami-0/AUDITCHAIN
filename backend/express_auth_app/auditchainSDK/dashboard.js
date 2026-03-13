const express = require("express")
const path = require("path")
const AuditLogModel = require("./models/AuditLog")

const router = express.Router()

router.get("/", async (req, res) => {

    const AuditLog = AuditLogModel()

    const logs = await AuditLog.findAll({
        order: [["id", "DESC"]],
        limit: 100
    })

    const viewPath = path.join(__dirname, "views", "auditDashboard.ejs")

    res.render(viewPath, { logs })
})

module.exports = router
