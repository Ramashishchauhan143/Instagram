const User = require('../models/User');

function requireObjectId(id) {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    const error = new Error('Invalid user id.');
    error.statusCode = 400;
    throw error;
  }
}

async function getUser(req, res) {
  requireObjectId(req.params.id);
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json({ user });
}

async function updateProfile(req, res) {
  const allowedFields = ['username', 'profilePicture', 'bio'];
  const requestedFields = Object.keys(req.body);
  const invalidField = requestedFields.find((field) => !allowedFields.includes(field));
  const updates = {};

  if (invalidField) {
    return res.status(400).json({ message: `Profile field "${invalidField}" cannot be updated.` });
  }

  if (requestedFields.length === 0) {
    return res.status(400).json({ message: 'Provide at least one profile field to update.' });
  }

  for (const field of requestedFields) {
    if (typeof req.body[field] !== 'string') {
      return res.status(400).json({ message: `${field} must be a string.` });
    }
    updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ user });
}

async function followUser(req, res) {
  requireObjectId(req.params.id);

  if (req.params.id.toLowerCase() === req.user.id.toLowerCase()) {
    return res.status(400).json({ message: 'You cannot follow yourself.' });
  }

  const target = await User.findById(req.params.id);

  if (!target) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await Promise.all([
    User.updateOne({ _id: req.user.id }, { $addToSet: { following: target.id } }),
    User.updateOne({ _id: target.id }, { $addToSet: { followers: req.user.id } })
  ]);

  res.status(200).json({ message: 'User followed.', userId: target.id });
}

async function unfollowUser(req, res) {
  requireObjectId(req.params.id);

  if (req.params.id.toLowerCase() === req.user.id.toLowerCase()) {
    return res.status(400).json({ message: 'You cannot unfollow yourself.' });
  }

  const target = await User.findById(req.params.id);

  if (!target) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await Promise.all([
    User.updateOne({ _id: req.user.id }, { $pull: { following: target.id } }),
    User.updateOne({ _id: target.id }, { $pull: { followers: req.user.id } })
  ]);

  res.status(200).json({ message: 'User unfollowed.', userId: target.id });
}

module.exports = { getUser, updateProfile, followUser, unfollowUser };
