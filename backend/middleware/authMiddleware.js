const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('A Bearer token is required.');
    error.statusCode = 401;
    throw error;
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const error = new Error('Invalid or expired token.');
    error.statusCode = 401;
    throw error;
  }

  if (!decoded || typeof decoded !== 'object' || typeof decoded.id !== 'string') {
    const error = new Error('Invalid or expired token.');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    const error = new Error('The user for this token no longer exists.');
    error.statusCode = 401;
    throw error;
  }

  req.user = user;
  next();
});

module.exports = { protect };
