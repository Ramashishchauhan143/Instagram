const express = require('express');
const {
  register,
  login,
  getCurrentUser
} = require('../controllers/authController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', protect, asyncHandler(getCurrentUser));

module.exports = router;
