
const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Rate limiting middleware for authentication endpoints
// Prevents brute-force attacks
//
// PRODUCTION NOTE: The default MemoryStore is NOT suitable for multi-instance deployments
// as rate limits are not shared across processes. For production with multiple servers/instances:
// 1. Install a Redis-backed store: npm install rate-limit-redis redis
// 2. Configure it: 
//    const RedisStore = require('rate-limit-redis');
//    const redis = require('redis');
//    const redisClient = redis.createClient({ url: process.env.REDIS_URL });
//    Then add to rateLimit config: store: new RedisStore({ client: redisClient })
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Note: Uses default MemoryStore (suitable for single-instance development only)
  // Client IP is extracted from req.ip which respects the trust proxy setting
});

router.post('/register', authLimiter, registerUser);

router.post('/login', authLimiter, loginUser);

module.exports = router;