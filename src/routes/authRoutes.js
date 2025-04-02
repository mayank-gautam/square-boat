const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authenticateUser, logout);

module.exports = router;
