const validUrl = require('valid-url');
const Url = require('../models/Url');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

// Cache nanoid import (ESM-only module) to avoid re-importing on every request
let nanoidFn;
const getNanoid = async () => {
  if (!nanoidFn) {
    const { nanoid } = await import('nanoid');
    nanoidFn = nanoid;
  }
  return nanoidFn;
};

const verifyUrlReachable = async (urlStr) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(urlStr, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Accept valid responses and protected pages (401, 403, 405)
    if (response.ok || response.status < 400 || response.status === 405 || response.status === 403 || response.status === 401) {
      return true;
    }
    return false;
  } catch (error) {
    // If HEAD fails, try GET as a fallback (some servers block HEAD)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); 
      const response = await fetch(urlStr, { 
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (response.ok || response.status < 400 || response.status === 403 || response.status === 401) {
        return true;
      }
      return false;
    } catch (e) {
      return false; // ENOTFOUND, Timeout, etc.
    }
  }
};

const shortenUrl = async (req, res) => {
  const { longUrl, expiresInDays } = req.body;

  if (!longUrl) {
    return res.status(400).json({ success: false, error: 'Please provide a URL' });
  }
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ success: false, error: 'Invalid URL format provided' });
  }

  // Actively verify if the URL is reachable
  const isReachable = await verifyUrlReachable(longUrl);
  if (!isReachable) {
    return res.status(400).json({ success: false, error: 'The provided URL is not reachable or does not exist. Please check and try again.' });
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

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    const deviceType = result.device.type || 'Desktop'; // Default to Desktop if not mobile/tablet

    // Get client IP
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress || '';
    if (ip.includes(',')) {
      ip = ip.split(',')[0].trim(); // Get the first IP in case of multiple proxies
    }
    
    // Convert IPv4-mapped IPv6 addresses to standard IPv4
    if (ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }
    


    let country = 'Unknown';
    let city = 'Unknown';

    // Offline lookup
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      const geo = geoip.lookup(ip);
      if (geo) {
        country = geo.country || 'Unknown';
        city = geo.city || 'Unknown';
      }
    }

    const analyticsData = {
      timestamp: Date.now(),
      userAgent: userAgent,
      referrer: req.headers['referer'] || req.headers['referrer'] || 'Direct',
      ip: ip,
      country: country,
      city: city,
      deviceType: deviceType
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