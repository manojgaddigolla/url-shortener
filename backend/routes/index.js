const express = require('express');
const { redirectToUrl } = require('../controllers/urlController');
const router = express.Router();

router.get('/:code', redirectToUrl);

module.exports = router;