const express = require('express');
const rateLimit = require('express-rate-limit');
const { redirectToUrl } = require('../controllers/urlController');
const router = express.Router();

const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 redirects per minute per IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// GET request for normal redirect (or to render password form if protected)
router.get('/:code', redirectLimiter, redirectToUrl);

// POST request to submit password for protected links
router.post('/:code', redirectLimiter, redirectToUrl);

module.exports = router;