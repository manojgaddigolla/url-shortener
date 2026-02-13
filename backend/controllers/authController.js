const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  // We'll build the logic here in the next section.
  // For now, let's confirm the controller is connected.
  res.status(200).json({ success: true, message: 'Auth Controller is connected!' });
};

module.exports = {
  registerUser,
};