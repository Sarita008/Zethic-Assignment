import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { LoadingButton } from '../common/Loading';
import { validateEmail } from '../../utils/helpers';

const LoginForm = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const handleLogin = async (data) => {
    clearError();
    try {
      await login(data.email, data.password);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                validate: (value) => validateEmail(value) || 'Please enter a valid email address'
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`input-field pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required'
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            loading={loading}
            className="btn-primary w-full"
          >
            Sign In
          </LoadingButton>

          {/* Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;