import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const LoginPage = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      const token = response?.token || response?.data?.token;

      if (token) {
        login(token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Login successful, but no token was provided.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 md:mt-16 animate-[fade-in_0.3s_ease-out]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-slate-500">Log in to manage your shortened links</p>
      </div>

      <div className="saas-card p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              id="email"
              type="email"
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="saas-input w-full p-3"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="saas-input w-full p-3"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center font-medium animate-[shake_0.5s_ease-in-out]" role="alert">
              {error}
            </div>
          )}
          
          <button type="submit" disabled={isLoading} className="saas-btn-primary w-full py-3 mt-4 disabled:opacity-70">
            {isLoading ? <Spinner size="small" /> : 'Log in to Dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;