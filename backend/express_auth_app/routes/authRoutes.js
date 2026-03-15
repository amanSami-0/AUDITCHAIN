const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authUser } = require("../middleware/authMiddleware");

router.post("/login", authController.login);

router.post("/signup", authController.signup);

router.get("/profile", authUser, authController.profile);

router.post("/update", authUser, authController.update);

router.post("/delete", authUser, authController.deleteAccount);

router.post("/forgot", authController.forgotPassword);

router.post("/logout", authController.logout);

router.post("/settings", authUser, authController.updateSettings);

module.exports = router;
