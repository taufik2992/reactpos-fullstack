const express = require('express');
const {
  getDashboardStats,
  getRevenueReport,
  getProductReport,
  getStaffReport,
  getCustomerReport
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/auth');
const { checkShiftTime } = require('../middlewares/shiftTracker');

const router = express.Router();

// Apply auth and shift checking to all routes
router.use(protect);
router.use(checkShiftTime);

// Dashboard statistics (accessible by all authenticated users)
router.get('/stats', getDashboardStats);

// Reports (admin only)
router.get('/reports/revenue', authorize('admin'), getRevenueReport);
router.get('/reports/products', authorize('admin'), getProductReport);
router.get('/reports/staff', authorize('admin'), getStaffReport);
router.get('/reports/customers', authorize('admin'), getCustomerReport);

module.exports = router;