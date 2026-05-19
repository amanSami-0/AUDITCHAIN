const { generateHash } = require("./hash");
const geoip = require("geoip-lite");

let AuditLog;

exports.init = async (sequelize) => {
    AuditLog = require("./models/AuditLog")(sequelize);
    await AuditLog.sync();
    console.log("✅ AuditLog table created");
};

exports.log = async (data) => {

    try {

        const geo = geoip.lookup(data.ip_address || "");
        const location = geo
            ? `${geo.country}, ${geo.city || "Unknown"}`
            : "Unknown";

        if (data.action === "PAGE_VISIT") {

            const existing = await AuditLog.findOne({
                where: {
                    page: data.page,
                    method: data.method,
                    ip_address: data.ip_address
                },
                order: [["id", "DESC"]]
            });

            if (existing &&
                (Date.now() - new Date(existing.createdAt).getTime()) < 2000
            ) {
                existing.visit_count += 1;
                await existing.save();
                return;
            }
        }

        const lastLog = await AuditLog.findOne({
            order: [["id", "DESC"]]
        });

        const previous_hash = lastLog ? lastLog.current_hash : "GENESIS";

        const logData = {
            ...data,
            location,
            previous_hash
        };

        const current_hash = generateHash(logData);

        await AuditLog.create({
            ...logData,
            current_hash
        });

        if (data.status === "SUSPICIOUS" || data.status === "BLOCKED") {
            console.log("🚨 ALERT:", data);
        }

    } catch (err) {
        console.error("Audit Log Error:", err);
    }
};
