import axios from 'axios';

export const createShortUrl = async (longUrl, expiresInDays, customAlias, password, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post('/api/short/shorten', { longUrl, expiresInDays, customAlias, password }, { headers });
    return response.data.data;
  } catch (error) {
    console.error('API Error: Failed to create short URL', error);

    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};
