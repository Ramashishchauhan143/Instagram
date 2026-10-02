const express = require('express');

const {
  getUser,
  updateProfile,
  followUser,
  unfollowUser
} = require('../controllers/userController');

const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get logged-in user's profile
router.get('/profile', protect, asyncHandler(async (req, res) => {
  res.status(200).json({
    user: req.user
  });
}));

// Get user by ID
router.get('/:id', asyncHandler(getUser));

// Update logged-in user's profile
router.put('/profile', protect, asyncHandler(updateProfile));

// Follow user
router.post('/:id/follow', protect, asyncHandler(followUser));

// Unfollow user
router.post('/:id/unfollow', protect, asyncHandler(unfollowUser));

module.exports = router;