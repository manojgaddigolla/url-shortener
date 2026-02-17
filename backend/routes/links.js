
const express = require('express');
const router = express.Router();


router.get('/my-links', (req, res) => {
  // This is a placeholder for now. In a future task, we will add logic
  // to fetch the links from the database for the authenticated user.
  res.status(200).json({ success: true, message: 'My Links route is working!' });
});

// Export the router so it can be mounted in our main server.js file.
module.exports = router;