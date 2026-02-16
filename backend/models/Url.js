const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
    urlCode : {
        type : String,
        required : true,
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
    // We are storing the user's unique MongoDB ID (_id).
    type: mongoose.Schema.Types.ObjectId,
    // The 'ref' property tells Mongoose that this ID refers to a document
    // in the 'User' collection. This is crucial for using Mongoose's 'populate' feature later.
    ref: 'User',
    // This field is not strictly required. This is a design choice that allows us to
    // still support the original functionality where anonymous, non-logged-in users can create short links.
    // If a link is created by a guest, this field will simply be empty.
    required: false,
  },
});

module.exports = mongoose.model('Url',UrlSchema)