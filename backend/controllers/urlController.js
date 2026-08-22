const validUrl = require('valid-url');
const { getAuth } = require('@clerk/express');
const Url = require('../models/Url');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const bcrypt = require('bcryptjs');

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
  const { longUrl, expiresInDays, customAlias, password } = req.body;

  if (!longUrl) {
    return res.status(400).json({ success: false, error: 'Please provide a URL' });
  }
  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ success: false, error: 'Invalid base URL' });
  }

  // Validate custom alias if provided
  if (customAlias) {
    const aliasRegex = /^[a-zA-Z0-9-]+$/;
    if (!aliasRegex.test(customAlias)) {
      return res.status(400).json({ success: false, error: 'Custom alias can only contain letters, numbers, and hyphens.' });
    }
    if (customAlias.length > 30) {
      return res.status(400).json({ success: false, error: 'Custom alias cannot exceed 30 characters.' });
    }
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
    let userId = undefined;
    try {
      const auth = getAuth(req);
      if (auth && auth.userId) {
        userId = auth.userId;
      }
    } catch (e) {
      // Ignore if unauthenticated
    }
    
    // Check if the custom alias is already taken
    if (customAlias) {
      const existingAlias = await Url.findOne({ urlCode: customAlias });
      if (existingAlias) {
        return res.status(400).json({ success: false, error: 'Custom alias is already in use. Please choose another one.' });
      }
    } else {
      // If no custom alias is provided, check if user already shortened this longUrl
      // Note: We don't reuse if they are setting a password, since they might want a new protected link
      let url = await Url.findOne({ longUrl: longUrl, user: userId });
      if (url && !password) {
        return res.status(200).json({ success: true, data: url });
      }
    }

    let urlCode = customAlias;
    if (!urlCode) {
      const nanoid = await getNanoid();
      urlCode = nanoid(7);
    }

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

    if (password) {
      const salt = await bcrypt.genSalt(10);
      newUrlData.passwordHash = await bcrypt.hash(password, salt);
    }

    if (userId) {
      newUrlData.user = userId;
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

    if (urlCheck.passwordHash) {
       const submittedPassword = req.body && req.body.password;
       let passwordError = '';

       if (req.method === 'POST' && submittedPassword) {
         const isMatch = await bcrypt.compare(submittedPassword, urlCheck.passwordHash);
         if (!isMatch) {
            passwordError = 'Incorrect password. Please try again.';
         }
       }
       
       if (req.method === 'GET' || passwordError || (req.method === 'POST' && !submittedPassword)) {
         return res.status(401).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Protected Link</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <script>
                tailwind.config = { darkMode: 'class' }
              </script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                /* Simple auto dark mode based on system preference */
                @media (prefers-color-scheme: dark) {
                  body { background-color: #0f172a; }
                  .card { background-color: #1e293b; border-color: #334155; }
                  h1 { color: #f8fafc; }
                  p { color: #94a3b8; }
                  input { background-color: #0f172a; border-color: #334155; color: #f8fafc; }
                  .icon-bg { background-color: rgba(99, 102, 241, 0.2); color: #818cf8; }
                }
              </style>
            </head>
            <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4">
              <div class="card bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                <div class="icon-bg w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h1 class="text-2xl font-bold text-slate-900 mb-2">Protected Link</h1>
                <p class="text-slate-500 mb-8">This URL requires a password to access.</p>
                
                <form method="POST" action="/${req.params.code}" class="space-y-4">
                  <div>
                    <input type="password" name="password" placeholder="Enter password" required autofocus
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-700 bg-slate-50 focus:bg-white text-center"
                    >
                  </div>
                  ${passwordError ? `<p class="text-rose-500 text-sm font-medium animate-pulse">${passwordError}</p>` : ''}
                  <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow">
                    Unlock Link
                  </button>
                </form>
              </div>
            </body>
            </html>
         `);
       }
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