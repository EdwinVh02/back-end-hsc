const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.post("/register", authController.registerUser);
router.post("/recuperarcontrasena", authController.recuperarContrasena);

module.exports = router;
