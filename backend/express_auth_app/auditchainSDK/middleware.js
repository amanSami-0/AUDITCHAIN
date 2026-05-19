const { DataTypes } = require("sequelize");
const geoip = require("geoip-lite");

const MAX_ATTEMPTS = 5;
const TIME_WINDOW = 5 * 60 * 1000;
const BLOCK_TIME = 10 * 60 * 1000;

module.exports = (sequelize, auditLogger) => {

    const LoginAttempt = sequelize.define("LoginAttempt", {
        email: DataTypes.STRING,
        ip_address: DataTypes.STRING,
        device: DataTypes.STRING,
        attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
        last_attempt: DataTypes.DATE,
        blocked_until: DataTypes.DATE
    });

    LoginAttempt.sync();

    return async (req, res, next) => {

        try {

            const ip =
                req.headers["x-forwarded-for"]?.split(",")[0] ||
                req.socket?.remoteAddress ||
                "UNKNOWN";

            const device = req.headers["user-agent"] || "UNKNOWN";
            const geo = geoip.lookup(ip);
            const location = geo ? `${geo.country}, ${geo.city || "Unknown"}` : "Unknown";

            // =====================================
            // 🔥 FIXED AUDIT ROUTE SKIP
            // =====================================
            if (
                req.originalUrl.startsWith("/audit") ||
                req.baseUrl.startsWith("/audit")
            ) {
                return next();
            }

            // =====================================
            // STATIC FILES
            // =====================================
            if (
                req.path.startsWith("/css") ||
                req.path.startsWith("/js") ||
                req.path.startsWith("/images") ||
                req.path.startsWith("/public")
            ) {
                return next();
            }

            // =====================================
            // PAGE VISIT
            // =====================================
         // =====================================
// PAGE VISIT
// =====================================
if (req.method === "GET") {

    // =====================================
    // SKIP AUTO REDIRECT AFTER SIGNUP
    // =====================================
if (

    req.path === "/login" &&

    req.headers.referer &&

    req.headers.referer.includes("/signup") &&

    !req.headers.accept?.includes("text/html")

) {

    return next();
}

    // =====================================
    // ONLY LOG REAL PAGE NAVIGATIONS
    // =====================================
    const acceptHeader =
        req.headers.accept || "";

    if (
        !acceptHeader.includes("text/html")
    ) {

        return next();
    }

    await auditLogger.log({
        action: "PAGE_VISIT",
        page: req.path,
        method: req.method,
        user_id: req.user?.id || null,
        ip_address: ip,
        device,
        location,
        status: "INFO"
    });
}

            // =====================================
            // AUDIT FUNCTIONS
            // =====================================
            req.audit = {

                logAction: async (action, user_id = null, attribute_name = null) => {

                    await auditLogger.log({
                        action,
                        page: req.path,
                        method: req.method,
                        user_id: user_id || req.user?.id || null,
                        ip_address: ip,
                        device,
                        location,
                        status: "SUCCESS",
                        attribute_name
                    });
                },

                trackLogin: async (email, success, user_id = null) => {

                    if (!email || success === null || success === undefined) {
                        return { blocked: false };
                    }

                    let record = await LoginAttempt.findOne({
                        where: { email, ip_address: ip }
                    });

                    const now = new Date();

                    if (!record) {
                        record = await LoginAttempt.create({
                            email,
                            ip_address: ip,
                            device,
                            attempts: 0,
                            last_attempt: now
                        });
                    }

                    if (record.blocked_until && now > record.blocked_until) {
                        record.blocked_until = null;
                        record.attempts = 0;
                        await record.save();
                    }

                    if (record.blocked_until && now < record.blocked_until) {

                        record.attempts += 1;
                        await record.save();

                        await auditLogger.log({
                            action: "LOGIN_BLOCKED",
                            page: "/login",
                            method: "POST",
                            user_id,
                            ip_address: ip,
                            device,
                            location,
                            status: "BLOCKED",
                            attempt_count: record.attempts
                        });

                        return { blocked: true };
                    }

                    if (now - record.last_attempt > TIME_WINDOW) {
                        record.attempts = 0;
                    }

                    if (!success) {

                        record.attempts += 1;
                        record.last_attempt = now;

                        let status = "FAILED";

                        if (record.attempts >= MAX_ATTEMPTS) {
                            status = "SUSPICIOUS";
                            record.blocked_until = new Date(Date.now() + BLOCK_TIME);
                        }

                        await record.save();

                        await auditLogger.log({
                            action: "LOGIN_FAILED",
                            page: "/login",
                            method: "POST",
                            user_id,
                            ip_address: ip,
                            device,
                            location,
                            status,
                            attempt_count: record.attempts
                        });

                        return { blocked: !!record.blocked_until };
                    }

                    const prevAttempts = record.attempts;

                    record.attempts = 0;
                    record.blocked_until = null;
                    await record.save();

                    await auditLogger.log({
                        action: "LOGIN_SUCCESS",
                        page: "/login",
                        method: "POST",
                        user_id,
                        ip_address: ip,
                        device,
                        location,
                        status: "LOGGED_IN",
                        attempt_count: prevAttempts
                    });

                    return { blocked: false };
                }
            };

            next();

        } catch (err) {
            console.error("Middleware Error:", err);
            next();
        }
    };
};
