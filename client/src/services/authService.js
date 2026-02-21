import axios from 'axios';

const API_URL = '/api/auth/';

export const registerUser = async (userData) => {
  try {
    
    const response = await axios.post(API_URL + 'register', userData);

    return response.data;

  } catch (error) {
    console.error('API Error: User registration failed', error);
    
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('An unexpected error occurred during registration.');
    }
  }
};


export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(API_URL + 'login', credentials);

    return response.data;

  } catch (error) {
    console.error('API Error: User login failed', error);

    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw new Error('An unexpected error occurred during login.');
    }
  }
};