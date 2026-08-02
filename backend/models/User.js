const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  imageUrl: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
