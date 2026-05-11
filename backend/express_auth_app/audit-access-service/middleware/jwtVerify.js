const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    try {

        const token = req.cookies?.token;

        if (!token) {
            return res.json({ valid: false });
        }

        // ✅ DECODE JWT
        const decoded = jwt.verify(token, "JWT_SECRET");

        // ✅ ATTACH USER
        req.user = decoded;

        next();

    } catch (err) {

        console.log("JWT VERIFY ERROR:", err.message);

        return res.json({ valid: false });
    }
};
