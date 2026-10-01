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

router.get('/:id', asyncHandler(getUser));
router.put('/profile', protect, asyncHandler(updateProfile));
router.post('/:id/follow', protect, asyncHandler(followUser));
router.post('/:id/unfollow', protect, asyncHandler(unfollowUser));

module.exports = router;
