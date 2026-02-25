const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Validate JWT_SECRET at startup
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  const errorMsg = 'JWT_SECRET environment variable is not set or is empty';
  console.error(errorMsg);
  process.exit(1);
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password' });
    }

    // Normalize email for querying (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });

  } catch (err) {
    console.error('Registration Error:', err);

    // Handle MongoDB duplicate key errors (code 11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return res.status(400).json({ 
        success: false, 
        error: `A user with this ${field} already exists` 
      });
    }

    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Please provide an email and password');
      err.status = err.statusCode = 400;
      throw err;
    }

    // Normalize email for querying (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.status = err.statusCode = 401;
      throw err;
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      success: true,
      token: token,
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerUser,
  loginUser
};