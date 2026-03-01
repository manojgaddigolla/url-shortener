import React, { createContext, useState, useContext } from 'react';

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

  // Use lazy initializer to validate and clean up token before first render,
  // avoiding a synchronous setState call inside useEffect.
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && isTokenValid(storedToken)) {
      return storedToken;
    }
    if (storedToken) {
      localStorage.removeItem('token');
    }
    return null;
  });
  // isLoading is always false since auth state is synchronously initialized
  const isLoading = false;
  // Derive isAuthenticated from token validity (not just existence)
  const isAuthenticated = !!token && isTokenValid(token);
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};