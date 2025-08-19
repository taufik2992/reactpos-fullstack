const express = require('express');
const { body } = require('express-validator');
const {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateStock,
  getCategories
} = require('../controllers/menuController');
const { protect, authorize } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');
const { checkShiftTime } = require('../middlewares/shiftTracker');

const router = express.Router();

// Validation middleware
const menuValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Menu name must be at least 2 characters long'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Coffee', 'Tea', 'Food', 'Dessert', 'Beverage'])
    .withMessage('Invalid category'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
];

// Public routes (no auth required)
router.get('/', getAllMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItemById);

// Protected routes
router.use(protect);
router.use(checkShiftTime);

router.post('/', authorize('admin'), upload.single('image'), menuValidation, createMenuItem);
router.put('/:id', authorize('admin'), upload.single('image'), updateMenuItem);
router.delete('/:id', authorize('admin'), deleteMenuItem);
router.patch('/:id/stock', authorize('admin', 'cashier'), updateStock);

module.exports = router;