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

router.get('/:code', redirectLimiter, redirectToUrl);

module.exports = router;