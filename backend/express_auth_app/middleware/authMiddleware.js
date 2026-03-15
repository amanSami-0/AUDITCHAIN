const jwt = require("jsonwebtoken");

exports.authUser = (req, res, next) => {

    const token = req.cookies?.token;

    if (!token)
        return res.status(401).json({ error: "Unauthorized" });

    try {

        const decoded = jwt.verify(token, "JWT_SECRET");

        req.user = decoded;

        next();

    } catch {
        return res.status(401).json({ error: "Invalid token" });
    }
};
