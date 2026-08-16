const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const { getMyLinks, deleteLink, updateLink, getAIInsights, suggestAliases } = require('../controllers/linksController');

router.get('/my-links', requireAuth(), getMyLinks);
router.delete('/:id', requireAuth(), deleteLink);
router.patch('/:id', requireAuth(), updateLink);
router.post('/:id/ai-insights', requireAuth(), getAIInsights);
router.post('/suggest-aliases', requireAuth(), suggestAliases);

module.exports = router;