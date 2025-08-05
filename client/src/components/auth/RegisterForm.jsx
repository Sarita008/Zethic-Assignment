import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { LoadingButton } from '../common/Loading';
import { validateEmail } from '../../utils/helpers';
import { FILE_UPLOAD } from '../../utils/constants';

const RegisterForm = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  
  const { register: registerUser, loading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const password = watch('password');

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    setImageError('');

    if (!file) {
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
    const fileInput = document.getElementById('profileImage');
    if (fileInput) fileInput.value = '';
  };

  const handleRegister = async (data) => {
    clearError();
    try {
      await registerUser(
        {
          name: data.name,
          email: data.email,
          password: data.password
        },
        selectedImage
      );
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled by context
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join us to start exploring</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
          {/* Profile Image */}
          <div className="text-center">
            <div className="relative inline-block">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                  <UserCircleIcon className="w-10 h-10 text-gray-400" />
                </div>
              )}
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="mt-2">
              <label
                htmlFor="profileImage"
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <PhotoIcon className="w-4 h-4 mr-1" />
                {imagePreview ? 'Change Photo' : 'Add Photo'}
              </label>
              <input
                id="profileImage"
                type="file"
                accept={FILE_UPLOAD.ALLOWED_TYPES.join(',')}
                onChange={handleImageSelect}
                className="hidden"
              />
              {imageError && (
                <p className="text-xs text-red-600 mt-1">{imageError}</p>
              )}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Enter your full name"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Name must be less than 100 characters'
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

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
                placeholder="Create a password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Password must contain uppercase, lowercase, and number'
                  }
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

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`input-field ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="Confirm your password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match'
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <LoadingButton
            type="submit"
            loading={loading}
            className="btn-primary w-full"
          >
            Create Account
          </LoadingButton>

          {/* Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;