const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(userId) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_secret_key') {
    throw new Error('Set a private JWT_SECRET in backend/.env before starting the server.');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const { username, email, password } = req.body;

  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  const user = await User.create({
    username: username.trim(),
    email: email.trim(),
    password
  });

  res.status(201).json({
    token: createToken(user.id),
    user
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const passwordMatches = user && (await bcrypt.compare(password, user.password));

  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  user.password = undefined;

  res.status(200).json({
    token: createToken(user.id),
    user
  });
}

function getCurrentUser(req, res) {
  res.status(200).json({ user: req.user });
}

module.exports = { register, login, getCurrentUser };
