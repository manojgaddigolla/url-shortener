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
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 mt-10 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back!</h2>
        <p className="text-center text-slate-500 mb-6">Log in to access your dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div >
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center" role="alert">{error}</p>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700">Login</button>
        </form>


        <p className="mt-6 text-center text-sm">
          Don't have an account? <Link to="/register" className="font-medium text-blue-600 hover:underline">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;