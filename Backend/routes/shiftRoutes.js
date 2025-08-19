const express = require("express");
const {
  getCurrentShift,
  getAllShifts,
  clockOut,
  getShiftStats,
} = require("../controllers/shiftController");
const { protect } = require("../middlewares/auth");
const { checkShiftTime } = require("../middlewares/shiftTracker");

const router = express.Router();

// Apply auth and shift checking to all routes
router.use(protect);
router.use(checkShiftTime);

// Routes
router.get("/current", getCurrentShift);
router.get("/", getAllShifts);
router.get("/stats", getShiftStats);
router.post("/clock-out", clockOut);

module.exports = router;
