const express = require('express');
const {shortenUrl} = require('../controllers/urlController')
const router = express.Router();

router.post('/shorten',shortenUrl);

module.exports = router;