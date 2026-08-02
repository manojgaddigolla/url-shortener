const express = require('express');
const { clerkWebhook } = require('../controllers/webhookController');

const router = express.Router();

// The webhook route must receive raw body to verify signature
router.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

module.exports = router;
