import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, MapPin, LogOut, Settings } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = {
    eventsCreated: 3,
    eventsJoined: 8,
    totalConnections: 24
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your account and view your activity
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-cream-100 dark:bg-gray-800 shadow-2xl rounded-2xl border border-cream-200 dark:border-gray-700 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-cream-300 to-cream-300 h-40"></div>
          
          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="absolute -top-20 left-8">
              <div className="w-40 h-40 bg-cream-100 dark:bg-gray-800 rounded-full border-4 border-cream-100 dark:border-gray-800 shadow-2xl flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-r from-cream-300 to-cream-300 rounded-full flex items-center justify-center">
                  <User className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-24">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{user?.name}</h2>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                    <Mail className="h-5 w-5 mr-3" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>Member since February 2025</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mt-6 sm:mt-0">
                  <button className="flex items-center space-x-2 px-6 py-3 border border-cream-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-cream-200 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105">
                    <Settings className="h-5 w-5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-xl text-sm font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 transform hover:scale-105"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-cream-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-cream-200 dark:border-gray-700 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-cream-300 mb-3">{stats.eventsCreated}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Events Created</div>
          </div>
          <div className="bg-cream-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-cream-200 dark:border-gray-700 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-3">{stats.eventsJoined}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Events Joined</div>
          </div>
          <div className="bg-cream-100 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-cream-200 dark:border-gray-700 text-center transform hover:scale-105 transition-all duration-300">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-3">{stats.totalConnections}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Connections Made</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-cream-100 dark:bg-gray-800 shadow-2xl rounded-2xl border border-cream-200 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-6 border-b border-cream-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              {/* Activity Item */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-cream-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-cream-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-gray-900 dark:text-white">
                    <span className="font-medium">Created event</span> "Tech Meetup Istanbul"
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
                </div>
              </div>

              {/* Activity Item */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-gray-900 dark:text-white">
                    <span className="font-medium">Joined event</span> "Coffee & Code"
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">1 week ago</p>
                </div>
              </div>

              {/* Activity Item */}
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base text-gray-900 dark:text-white">
                    <span className="font-medium">Updated location</span> preferences
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2 weeks ago</p>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-base">Your activity will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;