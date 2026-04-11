const { generateHash } = require("./hash")
const EventEmitter = require("events")

const auditEvents = new EventEmitter()
exports.events = auditEvents
let AuditLog

// =====================
// INIT
// =====================
exports.init = async (sequelize) => {

    AuditLog = require("./models/AuditLog")(sequelize)

    // 🔥 force reset to ensure all columns exist
    await AuditLog.sync({ force: true })

    console.log("✅ AuditLog table created")
}


// =====================
// MAIN LOG FUNCTION
// =====================
exports.log = async (data) => {

    try {

        // =====================
        // 🔥 PAGE VISIT AGGREGATION
        // =====================
        if (data.action === "PAGE_VISIT") {

            const lastLog = await AuditLog.findOne({
                order: [["id", "DESC"]]
            })

            if (
                lastLog &&
                lastLog.action === "PAGE_VISIT" &&
                lastLog.page === data.page &&
                lastLog.ip_address === data.ip_address
            ) {
                lastLog.visit_count += 1
                await lastLog.save()
                return
            }
        }

        // =====================
        // 🔗 HASH CHAIN
        // =====================
        const lastLog = await AuditLog.findOne({
            order: [["id", "DESC"]]
        })

        const previous_hash = lastLog ? lastLog.current_hash : "GENESIS"

        const logData = {
            ...data,
            previous_hash
        }

        const current_hash = generateHash(logData)

        const newLog = await AuditLog.create({
            ...logData,
            current_hash
        })

        // 🔥 Broadcast new log to real-time subscribers
        auditEvents.emit("new_log", newLog)

    } catch (err) {
        console.error("Audit Log Error:", err)
    }
}
