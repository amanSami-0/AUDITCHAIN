const { initDatabase } = require("./database");

const auditLogger = require("./auditLogger");

const createMiddleware = require("./middleware");

const dashboardRouter = require("./dashboard");

let sequelize;

let middlewareInstance;

// =====================
// INIT
// =====================
async function init() {

    sequelize = initDatabase();

    await auditLogger.init(sequelize);

    middlewareInstance =
        createMiddleware(sequelize, auditLogger);

    console.log("✅ AuditChain SDK Initialized");
}

// =====================
// EXPORTS
// =====================
module.exports = {

    init,

    middleware: () => {

        if (!middlewareInstance) {

            throw new Error(
                "Audit SDK not initialized"
            );
        }

        return middlewareInstance;
    },

    // ✅ IMPORTANT
    dashboard: dashboardRouter,

    log: auditLogger.log,

    verifyChain: auditLogger.verifyChain
};
