import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    console.log('Login form data:', data);
    setIsLoading(true);

    try {
      const response = await authAPI.login(data);
      login(response.user, response.token);
      navigate('/');
    } catch (error) {
      setError('root', {
        message: 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-cream-300 to-cream-300 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <span className="text-white font-bold text-2xl">GG</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Sign in to your Gelen Gelsin account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-cream-100 dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-cream-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`appearance-none relative block w-full px-4 py-4 border ${
                  errors.email ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 focus:z-10 sm:text-base transition-all duration-200 shadow-inner`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`appearance-none relative block w-full px-4 py-4 pr-12 border ${
                    errors.password ? 'border-red-300 dark:border-red-500' : 'border-cream-200 dark:border-gray-600'
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-300 focus:border-cream-300 focus:z-10 sm:text-base transition-all duration-200 shadow-inner`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.root && (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-400">{errors.root.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-cream-300 hover:bg-cream-300/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cream-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-5 w-5 mr-3" />
                  Sign In
                </div>
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="rounded-xl bg-cream-200 dark:bg-gray-700 p-5 border border-cream-300 dark:border-gray-600">
            <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 font-semibold">Demo Credentials:</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Email: john@example.com</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Password: password123</p>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-base text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-cream-300 hover:text-cream-300/80 transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default Login;