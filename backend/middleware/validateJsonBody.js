function validateJsonBody(req, res, next) {
  if (req.body === undefined) {
    req.body = {};
  }

  if (req.body === null || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }

  next();
}

module.exports = validateJsonBody;
