function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error.';

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    statusCode = 400;
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A user with that username or email already exists.';
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    message = 'Request body contains invalid JSON.';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'Internal server error.';
  }

  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };
