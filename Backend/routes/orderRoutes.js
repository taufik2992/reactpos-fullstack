const express = require("express");
const { body } = require("express-validator");
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getOrderStats,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middlewares/auth");
const { checkShiftTime } = require("../middlewares/shiftTracker");

const router = express.Router();

// Validation middleware
const orderValidation = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),
  body("items.*.menuItemId").isMongoId().withMessage("Invalid menu item ID"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("customerName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Customer name must be at least 2 characters long"),
  body("paymentMethod")
    .optional()
    .isIn(["cash", "card", "digital", "midtrans"])
    .withMessage("Invalid payment method"),
];

// Apply auth and shift checking to all routes
router.use(protect);
router.use(checkShiftTime);

// Routes
router.get("/", getAllOrders);
router.get("/stats", authorize("admin"), getOrderStats);
router.get("/:id", getOrderById);
router.post("/", orderValidation, createOrder);
router.patch("/:id/status", authorize("admin", "cashier"), updateOrderStatus);

module.exports = router;
