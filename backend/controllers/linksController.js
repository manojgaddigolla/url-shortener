const Url = require('../models/Url');
const { getAuth } = require('@clerk/express');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini (Ensure API key is set in .env)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'PLACEHOLDER' });

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

const getAIInsights = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'AI features are not configured. Please add GEMINI_API_KEY to your .env file.' });
    }

    const link = await Url.findById(req.params.id);
    if (!link || link.user !== userId) {
      return res.status(404).json({ success: false, error: 'Link not found or unauthorized' });
    }

    const { question, context } = req.body;

    const systemPrompt = `You are an expert Data Analyst for Short.ly.
You are analyzing traffic telemetry for the shortened URL: ${link.shortUrl} (redirects to ${link.longUrl}).
The user has provided aggregated traffic data (context) based on their current dashboard filters.
Answer the user's question using the provided data.
Be concise, highly professional, and format your response in beautiful Markdown with bullet points or bold text for emphasis. Do not make up data.`;

    const prompt = `${systemPrompt}\n\n=== AGGREGATED DATA ===\n${JSON.stringify(context, null, 2)}\n\n=== USER QUESTION ===\n${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.status(200).json({ success: true, insight: response.text });
  } catch (err) {
    console.error('Error generating AI insights:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to generate AI insights' });
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
  getAIInsights,
};