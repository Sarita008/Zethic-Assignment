import { 
  ChatBubbleLeftIcon, 
  ClockIcon,
  UserCircleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { formatDate, truncateText, formatDuration } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

const QueryItem = ({ query }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0 py-4">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          {query.userId?.profileImage ? (
            <img
              src={query.userId.profileImage}
              alt={query.userId.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-4 h-4 text-gray-600" />
            </div>
          )}
        </div>

        {/* Query Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-sm font-medium text-gray-900">
              {query.userId?.name || 'Unknown User'}
            </p>
            <span className="text-gray-300">•</span>
            <div className="flex items-center text-xs text-gray-500">
              <GlobeAltIcon className="w-3 h-3 mr-1" />
              <span>{query.websiteId?.name || 'Unknown Website'}</span>
            </div>
          </div>

          {/* Question */}
          <div className="mb-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Q:</span> {truncateText(query.question, 100)}
            </p>
          </div>

          {/* Answer Preview */}
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">A:</span> {truncateText(query.answer, 150)}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              <span>{formatDate(query.createdAt, DATE_FORMATS.RELATIVE)}</span>
            </div>
            
            {query.responseTime && (
              <span>Response: {formatDuration(query.responseTime)}</span>
            )}
            
            {query.relevanceScore && (
              <span>Relevance: {Math.round(query.relevanceScore * 100)}%</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentQueries = ({ queries, loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className={`card p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!queries || queries.length === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Queries</h3>
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No recent queries</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Queries</h3>
        <div className="flex items-center text-sm text-gray-500">
          <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
          <span>{queries.length} queries</span>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {queries.map((query) => (
          <QueryItem key={query._id} query={query} />
        ))}
      </div>
    </div>
  );
};

export default RecentQueries;