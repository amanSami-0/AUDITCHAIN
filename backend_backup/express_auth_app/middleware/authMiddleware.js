const jwt = require("jsonwebtoken");

exports.authUser = (req, res, next) => {

    const token = req.cookies?.auth_token;

    const publicRoutes = ["/login", "/signup", "/forgot"];

    if (publicRoutes.includes(req.path) || req.path.startsWith("/audit")) {
        return next();
    }

    if (!token) {
        if (req.accepts('json')) return res.status(401).json({ error: "Unauthorized" });
        return res.redirect("/login");
    }

    try {

        const decoded = jwt.verify(token, "JWT_SECRET");

        req.user = decoded || null; // ✅ SAFE

        next();

    } catch {
        if (req.accepts('json')) return res.status(401).json({ error: "Invalid token" });
        return res.redirect("/login");
    }
};
