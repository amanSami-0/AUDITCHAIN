const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

// ROOT
router.get("/", (req, res) => res.redirect("/login"));

// LOGIN
router.get("/login", (req, res) => res.render("login"));
router.post("/login", controller.login);

// LOGOUT
router.get("/logout", controller.logout);

// DASHBOARD
router.get("/dashboard", controller.protect, (req, res) => {
    res.render("dashboard");
});

// ADMIN + OTHER ROUTES (keep yours)
router.get("/admin", controller.admin);
router.post("/register", controller.register);
router.get("/unblock/:id", controller.unblock);

router.get("/access-logs", controller.accessLogs);
router.get("/kick/:sessionId", controller.kickUser);
router.get("/delete/:id", controller.deleteDeveloper);

// VERIFY SESSION (IMPORTANT for main app)
router.get("/verify-session", controller.verifySession);

module.exports = router;
