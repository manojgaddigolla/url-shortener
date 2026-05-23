const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getMyLinks, deleteLink } = require('../controllers/linksController');

router.get('/my-links', auth, getMyLinks);
router.delete('/:id', auth, deleteLink);

module.exports = router;