const Url = require('../models/Url');
const { getAuth } = require('@clerk/express');

const getMyLinks = async (req, res) => {
  try {

    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    const links = await Url.find({ user: userId }).sort({ date: -1 });

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
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const link = await Url.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    // Verify the user owns the link
    if (link.user !== userId) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this link' });
    }

    await link.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error('Error deleting link:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const updateLink = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    const { expiresInDays } = req.body;
    const link = await Url.findById(req.params.id);

    if (!link) {
      return res.status(404).json({ success: false, error: 'Link not found' });
    }

    // Verify ownership
    if (link.user !== userId) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this link' });
    }

    let expiresAt = undefined;
    if (expiresInDays === null || expiresInDays === 'never') {
      expiresAt = null;
    } else if (expiresInDays && !isNaN(expiresInDays)) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    if (expiresAt !== undefined) {
      link.expiresAt = expiresAt;
      await link.save();
    }

    res.status(200).json({ success: true, data: link });
  } catch (err) {
    console.error('Error updating link:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  getMyLinks,
  deleteLink,
  updateLink,
};