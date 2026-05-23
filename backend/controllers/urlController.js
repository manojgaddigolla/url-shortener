const validUrl = require('valid-url');
const Url = require('../models/Url');

// Cache nanoid import (ESM-only module) to avoid re-importing on every request
let nanoidFn;
const getNanoid = async () => {
  if (!nanoidFn) {
    const { nanoid } = await import('nanoid');
    nanoidFn = nanoid;
  }
  return nanoidFn;
};

const shortenUrl = async (req, res) => {
  const { longUrl, expiresInDays } = req.body;

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
    let url = await Url.findOne({ longUrl: longUrl, user: req.user ? req.user.id : undefined });

    if (url) {
      return res.status(200).json({ success: true, data: url });
    }

    const nanoid = await getNanoid();
    const urlCode = nanoid(7);

    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

    let expiresAt = null;
    if (expiresInDays && !isNaN(expiresInDays)) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    const newUrlData = {
      longUrl,
      shortUrl,
      urlCode,
      expiresAt,
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
    const urlCheck = await Url.findOne({ urlCode: req.params.code });
    if (!urlCheck) {
      return res.status(404).json({ success: false, error: 'No URL found' });
    }

    if (urlCheck.expiresAt && new Date() > urlCheck.expiresAt) {
      return res.status(410).send(`
        <html>
          <head><title>Link Expired</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #333;">Link Expired</h1>
            <p style="color: #666;">This shortened link is no longer active because it has reached its expiration date.</p>
          </body>
        </html>
      `);
    }

    const analyticsData = {
      timestamp: Date.now(),
      userAgent: req.headers['user-agent'] || 'Unknown',
      referrer: req.headers['referer'] || req.headers['referrer'] || 'Direct'
    };

    const url = await Url.findOneAndUpdate(
      { urlCode: req.params.code },
      { 
        $inc: { clicks: 1 },
        $push: { analytics: analyticsData }
      },
      // new: false returns the pre-update document; we only need longUrl for the redirect
      { new: false, projection: { longUrl: 1 } }
    );

    if (url) {
      // Use 302 temporary redirect instead of 301 permanent redirect
      // This ensures all visits reach our server for accurate click tracking
      return res.redirect(302, url.longUrl);
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