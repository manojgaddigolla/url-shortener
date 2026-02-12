const validUrl = require('valid-url');
const Url = require('../models/Url');

const shortenUrl = async (req, res) => {
    const { longUrl } = req.body;

    console.log('Received long URL:', longUrl);

    if (!longUrl) {
        return res.status(400).json({ success: false, error: 'Please provide a URL' });
    }
    if (!validUrl.isUri(longUrl)) {
        return res.status(400).json({ success: false, error: 'Invalid URL format provided' });
    }
    try {
    let url = await Url.findOne({ longUrl: longUrl });

    if (url) {
      return res.status(200).json({ success: true, data: url });
    }

    const { nanoid } = await import('nanoid');
    
    const urlCode = nanoid(7);

    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

    url = await Url.create({
        longUrl,
        shortUrl,
        urlCode,
    });

    res.status(201).json({
      success: true,
      data: url
    });
    
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

      return res.redirect(301,url.longUrl);
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