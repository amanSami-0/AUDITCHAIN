const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authUser } = require("../middleware/authMiddleware");

router.get("/", authController.loginPage);
router.get("/login", authController.loginPage);
router.post("/login", authController.login);

router.get("/signup", authController.signupPage);
router.post("/signup", authController.signup);

router.get("/profile", authUser, authController.profile);

router.get("/update", authUser, authController.updatePage);
router.post("/update", authUser, authController.update);

router.get("/delete", authUser, authController.deletePage);
router.post("/delete", authUser, authController.deleteAccount);

router.get("/forgot", authController.forgotPage);
router.post("/forgot", authController.forgotPassword);

router.get("/logout", authController.logout);

module.exports = router;
