const validUrl = require('valid-url');
const Url = require('../models/Url');

const shortenUrl = async (req, res) => {
  const { longUrl } = req.body;

  if (!longUrl) {
    return res.status(400).json({ success: false, error: 'Please provide a URL' });
  }
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ success: false, error: 'Invalid URL format provided' });
  }

  // Sanitize log to avoid PII leakage - log only hostname and path
  try {
    const urlObj = new URL(longUrl);
    console.log('Received short URL request for:', urlObj.hostname + urlObj.pathname);
  } catch (e) {
    // If URL parsing fails, don't log anything
  }

  // Defensive check for BASE_URL (should be caught at startup, but check here too)
  if (!process.env.BASE_URL || process.env.BASE_URL.trim() === '') {
    return res.status(500).json({ success: false, error: 'Server configuration error: BASE_URL not set' });
  }

  try {
    let url = await Url.findOne({ longUrl: longUrl });

    if (url) {
      return res.status(200).json({ success: true, data: url });
    }

    const { nanoid } = await import('nanoid');

    const urlCode = nanoid(7);

    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

    const newUrlData = {
      longUrl,
      shortUrl,
      urlCode,
    };


    if (req.user) {

      newUrlData.user = req.user.id;
    }


    url = await Url.create(newUrlData);
    res.status(201).json({ success: true, data: url });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const redirectToUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ urlCode: req.params.code });

    if (url) {
      url.clicks++;
      await url.save();

      // Use 302 temporary redirect instead of 301 permanent redirect
      // This ensures all visits reach our server for accurate click tracking
      return res.redirect(302, url.longUrl);
    } else {
      return res.status(404).json({ success: false, error: 'No URL found' });
    }
  } catch (err) {
    console.error('Server error on redirect:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  shortenUrl,
  redirectToUrl,
};