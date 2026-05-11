const jwt = require("jsonwebtoken");

exports.authUser = (req, res, next) => {

    const token = req.cookies?.token;

    const publicRoutes = ["/login", "/signup", "/forgot"];

    if (publicRoutes.includes(req.path) || req.path.startsWith("/audit")) {
        return next();
    }

    if (!token) {
        return res.redirect("/login");
    }

    try {

        const decoded = jwt.verify(token, "JWT_SECRET");

        req.user = decoded || null; // ✅ SAFE

        next();

    } catch {
        return res.redirect("/login");
    }
};
