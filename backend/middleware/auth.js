const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');

  if (!token) {
    return next();
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded && decoded.user) {
      req.user = decoded.user;
    } else {
      return res.status(401).json({ success: false, error: 'Token is not valid' });
    }

    next();

  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ success: false, error: 'Token is not valid' });
  }
};

module.exports = auth;