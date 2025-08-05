import { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import WebsiteCard from './WebsiteCard';
import WebsiteForm from './WebsiteForm';
import Loading from '../common/Loading';
import websiteService from '../../services/websiteService';
import { CRAWL_STATUS } from '../../utils/constants';
import { debounce } from '../../utils/helpers';

const WebsiteList = ({ onWebsiteSelect = null, selectable = false }) => {
  const [websites, setWebsites] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadWebsites();
  }, []);

  useEffect(() => {
    filterWebsites();
  }, [websites, searchTerm, statusFilter, activeFilter]);

  const loadWebsites = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await websiteService.getAllWebsites();
      setWebsites(response.websites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterWebsites = () => {
    let filtered = [...websites];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(website => 
        website.name.toLowerCase().includes(term) ||
        website.url.toLowerCase().includes(term) ||
        (website.description && website.description.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(website => website.crawlStatus === statusFilter);
    }

    // Active filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(website => 
        activeFilter === 'active' ? website.isActive : !website.isActive
      );
    }

    setFilteredWebsites(filtered);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={loadWebsites} className="btn-primary">
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  if (showForm || editingWebsite) {
    return (
      <WebsiteForm
        website={editingWebsite}
        onSubmit={editingWebsite ? handleUpdateWebsite : handleCreateWebsite}
        onCancel={() => {
          setShowForm(false);
          setEditingWebsite(null);
        }}
        loading={actionLoading.create || actionLoading[`update-${editingWebsite?.id}`]}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Websites</h2>
          <p className="text-gray-600">Manage and monitor crawled websites</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Website
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search websites..."
              onChange={(e) => debounce(setSearchTerm(e.target.value), 300)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center space-x-4">
            <div className="message-bubble message-ai">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm whitespace-pre-wrap">{message.answer}</p>
              </div>
            </div>

            {/* Message Metadata */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{formatDate(message.createdAt, DATE_FORMATS.RELATIVE)}</span>
                </div>
                
                {message.responseTime && (
                  <span>
                    Response: {formatDuration(message.responseTime)}
                  </span>
                )}

                {message.relevanceScore && (
                  <span>
                    Relevance: {Math.round(message.relevanceScore * 100)}%
                  </span>
                )}
              </div>

              {showActions && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(message.answer)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy response"
                  >
                    {copied ? (
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="w-3 h-3" />
                    )}
                  </button>

                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors disabled:opacity-50"
                      title="Delete message"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;