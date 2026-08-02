const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express');
const { getMyLinks, deleteLink, updateLink } = require('../controllers/linksController');

router.get('/my-links', requireAuth(), getMyLinks);
router.delete('/:id', requireAuth(), deleteLink);
router.patch('/:id', requireAuth(), updateLink);

module.exports = router;