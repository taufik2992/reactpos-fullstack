const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');
const { checkShiftTime } = require('../middlewares/shiftTracker');

const router = express.Router();

// Validation middleware
const createUserValidation = [
  body('nama')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'cashier'])
    .withMessage('Role must be either admin or cashier')
];

// Apply auth and shift checking to all routes
router.use(protect);
router.use(checkShiftTime);

// Routes
router.get('/', authorize('admin'), getAllUsers);
router.post('/', authorize('admin'), upload.single('avatar'), createUserValidation, createUser);
router.put('/:id', authorize('admin'), upload.single('avatar'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;