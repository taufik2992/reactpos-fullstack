const express = require("express");
const {
  createPayment,
  handleNotification,
  getPaymentStatus,
} = require("../controllers/paymentController");
const { protect } = require("../middlewares/auth");
const { checkShiftTime } = require("../middlewares/shiftTracker");

const router = express.Router();

// Routes
router.post("/create", protect, checkShiftTime, createPayment);
router.post("/notification", handleNotification); // Webhook from Midtrans (no auth)
router.get("/status/:orderId", protect, checkShiftTime, getPaymentStatus);

// Payment result pages (for redirect from Midtrans)
router.get("/finish", (req, res) => {
  res.render("payment-result", {
    status: "success",
    message: "Payment completed successfully!",
  });
});

router.get("/error", (req, res) => {
  res.render("payment-result", {
    status: "error",
    message: "Payment failed. Please try again.",
  });
});

router.get("/pending", (req, res) => {
  res.render("payment-result", {
    status: "pending",
    message: "Payment is being processed.",
  });
});

module.exports = router;
