const Url = require('../models/Url');

const getMyLinks = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    const links = await Url.find({ user: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: links.length,
      data: links,
    });

  } catch (err) {
    console.error('Error fetching user links:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  getMyLinks,
};