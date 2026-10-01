const express = require('express');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost
} = require('../controllers/postController');
const { createComment, getComments } = require('../controllers/commentController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(asyncHandler(getPosts))
  .post(protect, asyncHandler(createPost));
router.route('/:id')
  .get(asyncHandler(getPost))
  .put(protect, asyncHandler(updatePost))
  .delete(protect, asyncHandler(deletePost));
router.post('/:id/like', protect, asyncHandler(likePost));
router.post('/:id/unlike', protect, asyncHandler(unlikePost));
router.route('/:postId/comments')
  .get(asyncHandler(getComments))
  .post(protect, asyncHandler(createComment));

module.exports = router;
