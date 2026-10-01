const Comment = require('../models/Comment');
const Post = require('../models/Post');

async function createComment(req, res) {
  const text = req.body.text;

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required.' });
  }

  const post = await Post.findById(req.params.postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  const comment = await Comment.create({
    post: post.id,
    user: req.user.id,
    text: text.trim()
  });

  post.comments.push(comment.id);
  await post.save();

  await comment.populate('user', 'username profilePicture');
  res.status(201).json({ comment });
}

async function getComments(req, res) {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  const comments = await Comment.find({ post: post.id })
    .sort({ createdAt: 1 })
    .populate('user', 'username profilePicture');

  res.status(200).json({ comments });
}

async function deleteComment(req, res) {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found.' });
  }

  if (comment.user.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Only the comment owner can delete this comment.' });
  }

  await Promise.all([
    comment.deleteOne(),
    Post.updateOne({ _id: comment.post }, { $pull: { comments: comment.id } })
  ]);

  res.status(200).json({ message: 'Comment deleted.' });
}

module.exports = { createComment, getComments, deleteComment };
