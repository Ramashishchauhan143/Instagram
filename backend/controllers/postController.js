const Comment = require('../models/Comment');
const Post = require('../models/Post');

async function getPopulatedPost(postId) {
  return Post.findById(postId)
    .populate('user', 'username profilePicture')
    .populate('likes', 'username profilePicture')
    .populate({
      path: 'comments',
      select: 'text createdAt user',
      populate: { path: 'user', select: 'username profilePicture' }
    });
}

async function createPost(req, res) {
  const { image, caption = '' } = req.body;

  if (typeof image !== 'string' || !image.trim()) {
    return res.status(400).json({ message: 'Image is required.' });
  }

  if (typeof caption !== 'string') {
    return res.status(400).json({ message: 'Caption must be a string.' });
  }

  const post = await Post.create({
    user: req.user.id,
    image: image.trim(),
    caption: caption.trim()
  });

  res.status(201).json({ post: await getPopulatedPost(post.id) });
}

async function getPosts(req, res) {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate('user', 'username profilePicture')
    .populate('likes', 'username profilePicture')
    .populate({
      path: 'comments',
      select: 'text createdAt user',
      populate: { path: 'user', select: 'username profilePicture' }
    });

  res.status(200).json({ posts });
}

async function getPost(req, res) {
  const post = await getPopulatedPost(req.params.id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  res.status(200).json({ post });
}

async function updatePost(req, res) {
  const allowedFields = ['image', 'caption'];
  const requestedFields = Object.keys(req.body);
  const invalidField = requestedFields.find((field) => !allowedFields.includes(field));

  if (invalidField) {
    return res.status(400).json({ message: `Post field "${invalidField}" cannot be updated.` });
  }

  if (requestedFields.length === 0) {
    return res.status(400).json({ message: 'Provide an image or caption to update.' });
  }

  const updates = {};
  for (const field of requestedFields) {
    if (typeof req.body[field] !== 'string' || (field === 'image' && !req.body[field].trim())) {
      return res.status(400).json({ message: `${field} must be a valid string.` });
    }
    updates[field] = req.body[field].trim();
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only the post owner can update this post.' });
  }

  Object.assign(post, updates);
  await post.save();

  res.status(200).json({ post: await getPopulatedPost(post.id) });
}

async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  if (post.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only the post owner can delete this post.' });
  }

  await Comment.deleteMany({ post: post.id });
  await post.deleteOne();

  res.status(200).json({ message: 'Post deleted.' });
}

async function likePost(req, res) {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user.id } },
    { new: true }
  );

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  res.status(200).json({ message: 'Post liked.', likesCount: post.likes.length });
}

async function unlikePost(req, res) {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user.id } },
    { new: true }
  );

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  res.status(200).json({ message: 'Post unliked.', likesCount: post.likes.length });
}

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost
};
