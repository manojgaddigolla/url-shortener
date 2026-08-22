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
    index: true,
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

  analytics: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    userAgent: {
      type: String
    },
    referrer: {
      type: String
    },
    ip: {
      type: String
    },
    country: {
      type: String
    },
    city: {
      type: String
    },
    deviceType: {
      type: String
    }
  }],

  expiresAt: {
    type: Date,
    default: null,
  },

  date: {
    type: Date,
    default: Date.now,
  },

  user: {
    type: String,
    required: false,
    index: true,
  },
  
  isPinned: {
    type: Boolean,
    default: false,
  },
  passwordHash: {
    type: String,
    required: false,
  },
});

UrlSchema.index({ user: 1, date: -1 });

// TTL Index: Automatically delete documents when expiresAt is reached.
// If expiresAt is null, the document will never be automatically deleted.
UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', UrlSchema);