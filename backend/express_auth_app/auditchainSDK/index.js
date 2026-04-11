const { initDatabase } = require("./database")
const auditLogger = require("./auditLogger")
const createMiddleware = require("./middleware")
const createDashboard = require("./dashboard")

let sequelize
let middlewareInstance
let dashboardInstance

// =====================
// INIT FUNCTION
// =====================
async function init() {

    // ✅ Initialize single DB instance
    sequelize = initDatabase()

    // ✅ Initialize AuditLog model + table
    await auditLogger.init(sequelize)

    // ✅ Create middleware (pass DB + logger)
    middlewareInstance = createMiddleware(sequelize, auditLogger)

    // ✅ Create dashboard router (same DB)
    dashboardInstance = createDashboard(sequelize)

    console.log("✅ AuditChain SDK Initialized")
}

// =====================
// EXPORTS
// =====================
module.exports = {

    // 🔥 Initialize SDK
    init,

    // 🔥 Middleware getter (used in app.js)
    middleware: () => {
        if (!middlewareInstance) {
            throw new Error("Audit SDK not initialized. Call audit.init() first.")
        }
        return middlewareInstance
    },

    // 🔥 Dashboard route handler
    dashboard: (req, res, next) => {
        if (!dashboardInstance) {
            return res.status(500).send("Audit dashboard not initialized")
        }
        return dashboardInstance(req, res, next)
    },

    // 🔥 Direct log access (optional)
    log: auditLogger.log
}
