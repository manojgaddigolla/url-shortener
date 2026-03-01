import axios from 'axios';

const API_URL = '/api/links/my-links';

export const getUserLinks = async (token) => {
  try {

    const response = await axios({
      method: 'GET',
      url: API_URL,
      headers: {
        'x-auth-token': token,
      },
    });

    return response.data;

  } catch (error) {
    console.error(
      'API Error: Failed to fetch user links',
      error.response?.data || error
    );

    if (error.response?.data) {
      throw error.response.data;
    }

    throw new Error('An unexpected error occurred while fetching links.');
  }
};