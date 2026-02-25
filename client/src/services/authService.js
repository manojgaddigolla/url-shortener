import axios from 'axios';

const API_URL = '/api/auth/';

// Map of server error messages to user-friendly messages
const errorMessageMap = {
  'Invalid credentials': 'Invalid email or password',
  'A user with this email already exists': 'This email is already registered',
  'Please provide an email and password': 'Email and password are required',
  'Please provide name, email, and password': 'All fields are required',
};

const sanitizeErrorMessage = (serverMessage) => {
  // Check if we have a friendly message for this error
  if (errorMessageMap[serverMessage]) {
    return errorMessageMap[serverMessage];
  }
  
  // Strip potential stack traces or sensitive details
  if (serverMessage && serverMessage.includes('at ') && serverMessage.includes('(')) {
    return 'An error occurred during authentication';
  }
  
  // For unknown messages, return a generic error
  if (!serverMessage || serverMessage.length > 200) {
    return 'Authentication failed. Please try again.';
  }
  
  return serverMessage;
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(API_URL + 'register', userData);
    
    // SECURITY WARNING: LocalStorage is vulnerable to XSS attacks
    // TODO: Migrate to HttpOnly cookies for production
    // Current implementation requires server to set HttpOnly, Secure, SameSite cookies
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;

  } catch (error) {
    // Log only safe fields to avoid leaking credentials or sensitive data
    console.error('Registration failed:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });
    
    if (error.response && error.response.data && error.response.data.error) {
      const sanitizedMessage = sanitizeErrorMessage(error.response.data.error);
      throw new Error(sanitizedMessage);
    } else {
      throw new Error('An unexpected error occurred during registration.');
    }
  }
};


export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(API_URL + 'login', credentials);

    // SECURITY WARNING: LocalStorage is vulnerable to XSS attacks
    // TODO: Migrate to HttpOnly cookies for production
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    // Log only safe fields to avoid leaking credentials
    console.error('Login failed:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });

    if (error.response && error.response.data && error.response.data.error) {
      const sanitizedMessage = sanitizeErrorMessage(error.response.data.error);
      throw new Error(sanitizedMessage);
    } else {
      throw new Error('An unexpected error occurred. Please check your connection and try again.');
    }
  }
};