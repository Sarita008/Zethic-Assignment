import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  GlobeAltIcon, 
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { LoadingButton } from '../common/Loading';
import { isValidUrl } from '../../utils/helpers';
import { VALIDATION_RULES } from '../../utils/constants';

const WebsiteForm = ({ 
  website = null, 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [urlError, setUrlError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: website?.name || '',
      url: website?.url || '',
      description: website?.description || '',
      crawlDepth: website?.crawlDepth || 1
    }
  });

  const watchedUrl = watch('url');

  const validateUrl = (url) => {
    if (!url) return 'URL is required';
    if (!isValidUrl(url)) return 'Please enter a valid URL';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'URL must start with http:// or https://';
    }
    return true;
  };

  const handleUrlBlur = () => {
    const url = watchedUrl;
    if (url && isValidUrl(url)) {
      // Auto-generate name from URL if name is empty
      const currentName = watch('name');
      if (!currentName) {
        try {
          const domain = new URL(url).hostname.replace('www.', '');
          const name = domain.split('.')[0];
          setValue('name', name.charAt(0).toUpperCase() + name.slice(1));
        } catch (error) {
          // Ignore error
        }
      }
    }
  };

  const handleFormSubmit = (data) => {
    // Ensure URL has protocol
    if (data.url && !data.url.startsWith('http')) {
      data.url = 'https://' + data.url;
    }
    
    onSubmit(data);
  };

  return (
    <div className="card p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <GlobeAltIcon className="w-6 h-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">
            {website ? 'Edit Website' : 'Add New Website'}
          </h2>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Website Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Website Name *
          </label>
          <input
            id="name"
            type="text"
            className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="e.g., OpenAI, React Documentation"
            {...register('name', {
              required: 'Website name is required',
              minLength: {
                value: VALIDATION_RULES.WEBSITE_NAME.MIN_LENGTH,
                message: `Name must be at least ${VALIDATION_RULES.WEBSITE_NAME.MIN_LENGTH} character`
              },
              maxLength: {
                value: VALIDATION_RULES.WEBSITE_NAME.MAX_LENGTH,
                message: `Name must be less than ${VALIDATION_RULES.WEBSITE_NAME.MAX_LENGTH} characters`
              }
            })}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Website URL */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Website URL *
          </label>
          <input
            id="url"
            type="url"
            className={`input-field ${errors.url ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="https://example.com"
            onBlur={handleUrlBlur}
            {...register('url', {
              required: 'URL is required',
              validate: validateUrl
            })}
          />
          {errors.url && (
            <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
          )}
          {urlError && (
            <p className="text-sm text-red-600 mt-1">{urlError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Enter the main URL of the website you want to crawl
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className={`input-field resize-none ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Brief description of the website (optional)"
            {...register('description', {
              maxLength: {
                value: VALIDATION_RULES.DESCRIPTION.MAX_LENGTH,
                message: `Description must be less than ${VALIDATION_RULES.DESCRIPTION.MAX_LENGTH} characters`
              }
            })}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Crawl Depth */}
        <div>
          <label htmlFor="crawlDepth" className="block text-sm font-medium text-gray-700 mb-1">
            Crawl Depth
          </label>
          <select
            id="crawlDepth"
            className="input-field"
            {...register('crawlDepth', {
              valueAsNumber: true
            })}
          >
            <option value={1}>1 - Main page only</option>
            <option value={2}>2 - Main page + direct links</option>
            <option value={3}>3 - Up to 3 levels deep</option>
          </select>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Crawl Depth Info:</p>
                <ul className="text-xs space-y-1">
                  <li>• <strong>Depth 1:</strong> Only the main page will be crawled</li>
                  <li>• <strong>Depth 2:</strong> Main page + pages linked from it</li>
                  <li>• <strong>Depth 3:</strong> Up to 3 levels of pages (may take longer)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
          
          <LoadingButton
            type="submit"
            loading={loading}
            className="btn-primary min-w-[120px]"
          >
            {website ? 'Update Website' : 'Add Website'}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default WebsiteForm;