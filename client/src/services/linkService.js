import axios from 'axios';

const API_URL = '/api/links';

export const getUserLinks = async (token) => {
  try {

    const response = await axios({
      method: 'GET',
      url: `${API_URL}/my-links`,
      headers: {
        Authorization: `Bearer ${token}`,
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

export const deleteUserLink = async (token, id) => {
  try {
    const response = await axios({
      method: 'DELETE',
      url: `${API_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to delete user link', error.response?.data || error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred while deleting link.');
  }
};

export const updateUserLink = async (token, id, data) => {
  try {
    const response = await axios({
      method: 'PATCH',
      url: `${API_URL}/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data,
    });
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to update user link', error.response?.data || error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred while updating link.');
  }
};

export const getAIInsights = async (token, id, question, context) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${API_URL}/${id}/ai-insights`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: { question, context },
    });
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to fetch AI insights', error.response?.data || error);
    if (error.response?.data) {
      throw error.response.data;
    }
    throw new Error('An unexpected error occurred while fetching AI insights.');
  }
};