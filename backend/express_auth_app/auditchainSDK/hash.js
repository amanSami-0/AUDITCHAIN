const crypto = require("crypto");

function generateHash(data) {

    // =====================================
    // FIXED FIELD ORDER
    // =====================================
    const safeData = {

        user_id:
            data.user_id || null,

        action:
            data.action || "",

        page:
            data.page || "",

        method:
            data.method || "",

        ip_address:
            data.ip_address || "",

        device:
            data.device || "",

        location:
            data.location || "",

        status:
            data.status || "",

        attempt_count:
            data.attempt_count || 0,

        timestamp:
            data.timestamp || 0,

        previous_hash:
            data.previous_hash || "GENESIS"
    };

    // =====================================
    // GENERATE HASH
    // =====================================
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(safeData))
        .digest("hex");
}

module.exports = {
    generateHash
};
