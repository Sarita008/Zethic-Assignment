import { useState, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  GlobeAltIcon,
  CheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import websiteService from '../../services/websiteService';
import { extractDomain, classNames } from '../../utils/helpers';
import Loading from '../common/Loading';

const WebsiteSelector = ({ 
  selectedWebsite, 
  onWebsiteSelect, 
  onAddWebsite = null 
}) => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await websiteService.getActiveWebsites();
      setWebsites(response.websites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteSelect = (website) => {
    onWebsiteSelect(website);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={classNames(
          'relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
          !selectedWebsite && 'text-gray-500'
        )}
      >
        <div className="flex items-center">
          <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3" />
          {selectedWebsite ? (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedWebsite.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {extractDomain(selectedWebsite.url)}
              </p>
            </div>
          ) : (
            <span className="block truncate">Select a website to chat about</span>
          )}
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon 
            className={classNames(
              'w-5 h-5 text-gray-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )} 
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-80 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {loading ? (
            <div className="py-8">
              <Loading size="sm" text="Loading websites..." />
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-sm text-red-600">
              Error: {error}
              <button
                onClick={loadWebsites}
                className="ml-2 text-primary-600 hover:text-primary-700"
              >
                Retry
              </button>
            </div>
          ) : websites.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <GlobeAltIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-3">No websites available</p>
              {onAddWebsite && (
                <button
                  onClick={() => {
                    onAddWebsite();
                    setIsOpen(false);
                  }}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Website
                </button>
              )}
            </div>
          ) : (
            <>
              {websites.map((website) => (
                <button
                  key={website.id}
                  onClick={() => handleWebsiteSelect(website)}
                  className="relative cursor-pointer select-none py-3 pl-3 pr-9 text-left hover:bg-gray-50 w-full transition-colors"
                >
                  <div className="flex items-center">
                    <GlobeAltIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {website.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {extractDomain(website.url)}
                      </p>
                      {website.lastCrawled && (
                        <p className="text-xs text-gray-400">
                          Updated {new Date(website.lastCrawled).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedWebsite && selectedWebsite.id === website.id && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <CheckIcon className="w-5 h-5 text-primary-600" />
                    </div>
                  )}
                </button>
              ))}

              {onAddWebsite && (
                <div className="border-t border-gray-200 mt-1">
                  <button
                    onClick={() => {
                      onAddWebsite();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add New Website
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default WebsiteSelector;