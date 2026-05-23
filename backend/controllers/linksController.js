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

const deleteLink = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const link = await Url.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    // Verify the user owns the link
    if (link.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this link' });
    }

    await link.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('Error deleting link:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  getMyLinks,
  deleteLink,
};