import React,{useState} from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value, 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await registerUser(formData);
      
      console.log('Registration successful:', response);
      setSuccess('Registration successful! Please log in.');
      setFormData({ name: '', email: '', password: '' });

    } catch (err) {
      const errorMessage = err.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err);
    }
  };

  return (
        <div className="max-w-md mx-auto">  
    <div  className="bg-white p-8 mt-10 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-2">Create Your Account</h2>
      <p className="text-center text-slate-500 mb-6">Join us to start creating your own short links!</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div >
          <label htmlFor="name"  className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            name='name'
            value={formData.name}
            onChange={handleChange}
            required
             className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
             className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-md font-semibold hover:bg-blue-700">Register</button>
      </form>

       {error && <p className="mt-4 text-center text-red-500" >{error}</p>}
      {success && <p className="mt-4 text-center text-green-500">{success}</p>}
      
      <p className="mt-6 text-center text-sm">
        Already have an account? 
        <Link to="/login" className="font-medium text-blue-600 hover:underline">Login here</Link> 
      </p>
    </div>
    </div>
  );
};

export default RegisterPage;