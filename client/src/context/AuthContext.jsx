import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

// Utility function to decode and validate JWT token
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    // Decode JWT payload (second part of token)
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode base64url payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check if token has expiry claim and if it's still valid
    if (!payload.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (error) {
    // Invalid token format or decoding error
    console.error('Token validation error:', error);
    return false;
  }
};

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Derive isAuthenticated from token validity (not just existence)
  const isAuthenticated = !!token && isTokenValid(token);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Validate the stored token
      if (isTokenValid(storedToken)) {
        setToken(storedToken);
      } else {
        // Token is expired or invalid - clear it
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const contextValue = {
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };


  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};