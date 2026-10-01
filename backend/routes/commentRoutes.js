const express = require('express');
const { deleteComment } = require('../controllers/commentController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.delete('/:id', protect, asyncHandler(deleteComment));

module.exports = router;
