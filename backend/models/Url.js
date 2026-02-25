const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  urlCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  longUrl: {
    type: String,
    required: true,
  },

  shortUrl: {
    type: String,
    required: true,
  },

  clicks: {
    type: Number,
    required: true,
    default: 0,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
});

module.exports = mongoose.model('Url', UrlSchema);