const express = require("express");
const { body } = require("express-validator");
const { login, logout, getProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const { checkShiftTime } = require("../middlewares/shiftTracker");

const router = express.Router();

// Validation middleware
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Routes
router.post("/login", loginValidation, login);
router.post("/logout", protect, logout);
router.get("/profile", protect, checkShiftTime, getProfile);

module.exports = router;
