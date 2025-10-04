// frontend/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-rose-500">AirMyHouse</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-rose-500 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            {user && (user.role === 'host' || user.role === 'both') && (
              <Link to="/host/dashboard" className="text-gray-700 hover:text-rose-500 px-3 py-2 rounded-md text-sm font-medium">
                Host Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-rose-500 px-3 py-2 rounded-md text-sm font-medium">
                  {user.first_name || user.username}
                </Link>
                <button
                  onClick={onLogout}
                  className="bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-rose-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-500 text-white px-4 py-2 rounded-full hover:bg-rose-600 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;