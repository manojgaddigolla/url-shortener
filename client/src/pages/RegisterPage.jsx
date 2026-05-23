import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [serverError, setServerError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = 'Name is required.';
    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email address is invalid.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    return errors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    
    const validationErrors = validate();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);

    try {
      const response = await registerUser(formData);
      const token = response?.token || response?.data?.token;

      if (token) {
        login(token);
        navigate('/dashboard', { replace: true });
      } else {
        setSuccess('Registration successful! You can now log in.');
        setFormData({ name: '', email: '', password: '' });
      }

    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 md:mt-16 animate-[fade-in_0.3s_ease-out]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create an Account</h2>
        <p className="text-slate-500">Join Short.ly and start managing your links today.</p>
      </div>

      <div className="saas-card p-8 md:p-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Jane Doe"
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              className={`saas-input w-full p-3 ${formErrors.name ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500 mt-1.5">{formErrors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className={`saas-input w-full p-3 ${formErrors.email ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
            {formErrors.email && (
              <p className="text-sm text-red-500 mt-1.5">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className={`saas-input w-full p-3 ${formErrors.password ? 'border-red-300 ring-1 ring-red-300' : ''}`}
            />
            {formErrors.password && (
              <p className="text-sm text-red-500 mt-1.5">{formErrors.password}</p>
            )}
          </div>

          {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm text-center font-medium">{success}</div>}

          {serverError && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center font-medium">{serverError}</div>}

          <button type="submit" disabled={isLoading} className="saas-btn-primary w-full py-3 mt-4 disabled:opacity-70">
            {isLoading ? <Spinner size="small" /> : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?
          <Link to="/login" className="ml-1 font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;