const { DataTypes, Op } = require("sequelize")

const MAX_ATTEMPTS = 3
const MAX_DEVICES = 3
const TIME_WINDOW = 5 * 60 * 1000
const BLOCK_TIME = 10 * 60 * 1000

module.exports = (sequelize, auditLogger) => {

    const LoginAttempt = sequelize.define("LoginAttempt", {
        email: DataTypes.STRING,
        ip_address: DataTypes.STRING,
        device: DataTypes.STRING,
        attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
        last_attempt: DataTypes.DATE,
        blocked_until: DataTypes.DATE
    })

    LoginAttempt.sync()

    return async (req, res, next) => {

        try {

            const ip =
                req.headers["x-forwarded-for"]?.split(",")[0] ||
                req.socket.remoteAddress

            const device = req.headers["user-agent"]

            // =====================
            // PAGE VISIT
            // =====================
            if (req.method === "GET") {
                await auditLogger.log({
                    action: "PAGE_VISIT",
                    page: req.path,
                    method: req.method,
                    ip_address: ip,
                    device,
                    status: "INFO"
                })
            }

            req.audit = {

                // =====================
                // GENERIC ACTION LOG
                // =====================
                logAction: async (action, user_id = null) => {
                    await auditLogger.log({
                        action,
                        page: req.path,
                        method: req.method,
                        user_id,
                        ip_address: ip,
                        device,
                        status: "SUCCESS"
                    })
                },

                // =====================
                // LOGIN TRACKING (FULL)
                // =====================
                trackLogin: async (email, success = null, user_id = null) => {

                    const now = new Date()

                    // 🔴 BLOCK CHECK ONLY
                    if (success === null) {

                        const blockedRecord = await LoginAttempt.findOne({
                            where: {
                                email,
                                blocked_until: {
                                    [Op.gt]: now
                                }
                            }
                        })

                        if (blockedRecord) {
                            await auditLogger.log({
                                action: "LOGIN_BLOCKED",
                                page: "/login",
                                method: "POST",
                                user_id,
                                ip_address: ip,
                                device,
                                status: "BLOCKED"
                            })
                        }

                        return { blocked: !!blockedRecord }
                    }

                    let record = await LoginAttempt.findOne({
                        where: { email, ip_address: ip }
                    })

                    if (!record) {
                        record = await LoginAttempt.create({
                            email,
                            ip_address: ip,
                            device,
                            attempts: 0,
                            last_attempt: now
                        })
                    }

                    // 🔴 GLOBAL BLOCK CHECK
                    const blockedRecord = await LoginAttempt.findOne({
                        where: {
                            email,
                            blocked_until: {
                                [Op.gt]: now
                            }
                        }
                    })

                    if (blockedRecord) {

                        await auditLogger.log({
                            action: "LOGIN_BLOCKED",
                            page: "/login",
                            method: "POST",
                            user_id,
                            ip_address: ip,
                            device,
                            status: "BLOCKED",
                            attempt_count: blockedRecord.attempts
                        })

                        return { blocked: true }
                    }

                    // =====================
                    // MULTI DEVICE DETECTION
                    // =====================
                    const uniqueIPs = await LoginAttempt.count({
                        where: { email },
                        distinct: true,
                        col: "ip_address"
                    })

                    if (uniqueIPs >= MAX_DEVICES) {

                        const blockTime = new Date(Date.now() + BLOCK_TIME)

                        await LoginAttempt.update(
                            { blocked_until: blockTime },
                            { where: { email } }
                        )

                        await auditLogger.log({
                            action: "MULTI_DEVICE_ATTACK",
                            page: "/login",
                            method: "POST",
                            user_id,
                            ip_address: ip,
                            device,
                            status: "SUSPICIOUS",
                            attempt_count: uniqueIPs
                        })

                        return { blocked: true }
                    }

                    // RESET WINDOW
                    if (now - record.last_attempt > TIME_WINDOW) {
                        record.attempts = 0
                    }

                    // =====================
                    // ❌ FAILED LOGIN
                    // =====================
                    if (!success) {

                        record.attempts += 1
                        record.last_attempt = now

                        let status = "FAILED"

                        if (record.attempts >= MAX_ATTEMPTS) {

                            status = "SUSPICIOUS"

                            const blockTime = new Date(Date.now() + BLOCK_TIME)

                            await LoginAttempt.update(
                                { blocked_until: blockTime },
                                { where: { email } }
                            )
                        }

                        await record.save()

                        await auditLogger.log({
                            action: "LOGIN_FAILED",
                            page: "/login",
                            method: "POST",
                            user_id,
                            ip_address: ip,
                            device,
                            status,
                            attempt_count: record.attempts
                        })

                        return { blocked: !!record.blocked_until }
                    }

                    // =====================
                    // ✅ SUCCESS LOGIN
                    // =====================
                    await LoginAttempt.update(
                        { attempts: 0, blocked_until: null },
                        { where: { email } }
                    )

                    await auditLogger.log({
                        action: "LOGIN_SUCCESS",
                        page: "/login",
                        method: "POST",
                        user_id,
                        ip_address: ip,
                        device,
                        status: "LOGGED_IN"
                    })

                    return { blocked: false }
                }
            }

            next()

        } catch (err) {
            console.error("Middleware Error:", err)
            next()
        }
    }
}
