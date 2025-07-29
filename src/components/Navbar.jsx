import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Plus, Home, User, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-cream-100 dark:bg-gray-900 shadow-xl border-b border-cream-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-cream-300 to-cream-300 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">GG</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Gelen Gelsin</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-cream-300 bg-cream-200 dark:bg-gray-800 shadow-inner' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-cream-300 hover:bg-cream-200 dark:hover:bg-gray-800'
              }`}
            >
              <Home size={18} />
              <span>Events</span>
            </Link>
            
            <Link
              to="/events/create"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/events/create') 
                  ? 'text-cream-300 bg-cream-200 dark:bg-gray-800 shadow-inner' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-cream-300 hover:bg-cream-200 dark:hover:bg-gray-800'
              }`}
            >
              <Plus size={18} />
              <span>Create Event</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/profile') 
                  ? 'text-cream-300 bg-cream-200 dark:bg-gray-800 shadow-inner' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-cream-300 hover:bg-cream-200 dark:hover:bg-gray-800'
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-cream-200 dark:bg-gray-800 hover:bg-cream-300 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block font-medium">
              Welcome, {user?.name}
            </span>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut size={18} />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-cream-300 bg-cream-200 dark:bg-gray-800' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-cream-300 hover:bg-cream-200 dark:hover:bg-gray-800'
              }`}
            >
              <Home size={18} />
              <span>Events</span>
            </Link>
            
            <Link
              to="/events/create"
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/events/create') 
                  ? 'text-cream-300 bg-cream-200 dark:bg-gray-800' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-cream-300 hover:bg-cream-200 dark:hover:bg-gray-800'
              }`}
            >
              <Plus size={18} />
              <span>Create</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/profile') 
                  ? 'text-cream-300 bg-cream-200 dark:bg-gray-800' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-cream-300 hover:bg-cream-200 dark:hover:bg-gray-800'
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;