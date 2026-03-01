import axios from 'axios';

export const createShortUrl = async (longUrl) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { 'x-auth-token': token } : {};
    const response = await axios.post('/api/short/shorten', { longUrl }, { headers });
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
