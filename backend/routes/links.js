const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {getMyLinks} = require('../controllers/linksController');

router.get('/my-links',auth,getMyLinks);

module.exports = router;