import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="saas-nav sticky top-0 z-50">
      <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
        <div className="text-2xl font-black tracking-tight text-indigo-600 flex items-center gap-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
          <Link to="/">Short.ly</Link>
        </div>

        <ul className="flex gap-4 sm:gap-6 items-center text-sm font-semibold">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/dashboard" className={`transition-colors duration-200 ${isActive('/dashboard') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
                  Dashboard
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="saas-btn-secondary px-4 py-2">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className={`transition-colors duration-200 ${isActive('/login') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="saas-btn-primary px-5 py-2">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;