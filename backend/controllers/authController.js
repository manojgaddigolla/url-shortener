const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
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
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const loginUser = async (req,res)=>{
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

     const payload = {
      user: {
        id: user._id,
      },
    };

    // 2. Sign the Token: We use the .sign() method from the jwt library.
    // It takes the payload, our secret key from the .env file, and an options object.
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h', // The token will be valid for 1 hour.
    });

    // 3. Send the Token to the Client
    // We send a 200 OK status with the success flag and the generated token.
    // The client will need to store this token to use for future protected requests.
    res.status(200).json({
      success: true,
      token: token,
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

module.exports = {
  registerUser,
  loginUser
};