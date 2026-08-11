const express = require('express');
const rateLimit = require('express-rate-limit');
const { shortenUrl } = require('../controllers/urlController');
const router = express.Router();

const shortenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 links per minute per IP
  message: { success: false, error: 'Too many links created from this IP, please try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/shorten', shortenLimiter, shortenUrl);

module.exports = router;