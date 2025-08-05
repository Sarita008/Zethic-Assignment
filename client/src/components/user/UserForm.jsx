import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  UserCircleIcon, 
  PhotoIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { LoadingButton } from '../common/Loading';
import { validateEmail, validateLength } from '../../utils/helpers';
import { FILE_UPLOAD, VALIDATION_RULES } from '../../utils/constants';

const UserForm = ({ 
  user = null, 
  onSubmit, 
  loading = false, 
  buttonText = 'Save' 
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [imageError, setImageError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    setImageError('');

    if (!file) {
      setSelectedImage(null);
      setImagePreview(user?.profileImage || null);
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
    setImagePreview(user?.profileImage || null);
    setImageError('');
    // Clear file input
    const fileInput = document.getElementById('profileImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data, selectedImage);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Profile Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Image
        </label>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            {imagePreview && (
              <button
                type="button"
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <label
          htmlFor="profileImage"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <PhotoIcon className="w-5 h-5 mr-2" />
          Choose Image
        </label>
        <input
          id="profileImage"
          type="file"
          accept={FILE_UPLOAD.ALLOWED_TYPES.join(',')}
          onChange={handleImageSelect}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2">
          JPEG, PNG, GIF or WebP. Max size 5MB.
        </p>
        {imageError && (
          <p className="text-sm text-red-600 mt-1">{imageError}</p>
        )}
      </div>
    </div>
  </div>

  {/* Name Field */}
  <div>
    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
      Full Name *
    </label>
    <input
      id="name"
      type="text"
      className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
      placeholder="Enter your full name"
      {...register('name', {
        required: 'Name is required',
        minLength: {
          value: VALIDATION_RULES.NAME.MIN_LENGTH,
          message: `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`
        },
        maxLength: {
          value: VALIDATION_RULES.NAME.MAX_LENGTH,
          message: `Name must be less than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`
        },
        validate: (value) => {
          const trimmed = value.trim();
          if (trimmed.length === 0) return 'Name cannot be empty';
          return true;
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
      Email Address *
    </label>
    <input
      id="email"
      type="email"
      className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
      placeholder="Enter your email address"
      {...register('email', {
        required: 'Email is required',
        validate: (value) => {
          if (!validateEmail(value)) {
            return 'Please enter a valid email address';
          }
          return true;
        }
      })}
    />
    {errors.email && (
      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
    )}
  </div>

  {/* Submit Button */}
  <div className="flex justify-end">
    <LoadingButton
      type="submit"
      loading={loading}
      className="btn-primary min-w-[120px]"
    >
      {buttonText}
    </LoadingButton>
  </div>
</form>
);
};
export default UserForm;