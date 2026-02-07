const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   name: {
    type: String,
    required: [true, 'Please provide a name'], 
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'], 
    unique: true, 
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ] 
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'], 
    minlength: 6, 
    select: false, 
  },
}, {
  timestamps: true, 
});

module.exports = mongoose.model('User',userSchema);