const crypto = require("crypto")

function generateHash(data) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(data))
        .digest("hex")
}

module.exports = { generateHash }
