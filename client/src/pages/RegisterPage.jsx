import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [serverError, setServerError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState('');

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
    const validationErrors = validate();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const response = await registerUser(formData);

      setSuccess('Registration successful! Please log in.');
      setFormData({ name: '', email: '', password: '' });

    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 mt-10 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-2">Create Your Account</h2>
        <p className="text-center text-slate-500 mb-6">Join us to start creating your own short links!</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div >
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.name && (
              <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div >
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.email && (
              <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Choose a strong password"
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {formErrors.password && (
              <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
            )}
          </div>

          {success && <p className="text-green-600 text-sm text-center">{success}</p>}

          {serverError && <p className="text-red-500 text-sm text-center">{serverError}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700">Register</button>
        </form>


        <p className="mt-6 text-center text-sm">
          Already have an account?
          <Link to="/login" className="font-medium text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;