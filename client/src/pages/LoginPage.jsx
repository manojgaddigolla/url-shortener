import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Both email and password are required.');
      return;
    }

    try {
      const response = await loginUser(formData);

      const token = response?.token || response?.data?.token;

      if (token) {
        login(token);
        navigate('/dashboard', { replace: true });
      }
      else {
        setError('Login successful, but no token was provided.');
      }
    } catch (err) {
      const errorMessage = err.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
    }
  };



  return (
    <div className="auth-container">
      <h2>Welcome Back!</h2>
      <p>Log in to access your dashboard.</p>

      {/* This form will also get an onSubmit handler later */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn">Login</button>
      </form>

      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      <p className="auth-switch">
        Don't have an account? <Link to="/register">Register now</Link>
      </p>
    </div>
  );
};

export default LoginPage;