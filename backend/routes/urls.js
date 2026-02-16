const express = require('express');
const {shortenUrl} = require('../controllers/urlController')
const auth = require('../middleware/auth')
const router = express.Router();

router.post('/shorten',auth,shortenUrl);

module.exports = router;