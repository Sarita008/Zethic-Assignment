import { useState } from 'react';
import { 
  GlobeAltIcon, 
  PlayIcon, 
  PauseIcon,
  ArrowPathIcon,
  TrashIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { formatDate, extractDomain, classNames } from '../../utils/helpers';
import { CRAWL_STATUS, CRAWL_STATUS_COLORS, DATE_FORMATS } from '../../utils/constants';
import { LoadingButton } from '../common/Loading';

const StatusBadge = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case CRAWL_STATUS.COMPLETED:
        return <CheckCircleIcon className="w-4 h-4" />;
      case CRAWL_STATUS.FAILED:
        return <ExclamationCircleIcon className="w-4 h-4" />;
      case CRAWL_STATUS.CRAWLING:
        return <ArrowPathIcon className="w-4 h-4 animate-spin" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  return (
    <span className={classNames(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      CRAWL_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
    )}>
      {getStatusIcon()}
      <span className="ml-1 capitalize">{status}</span>
    </span>
  );
};

const WebsiteCard = ({ 
  website, 
  onCrawl, 
  onRecrawl, 
  onToggleActive, 
  onDelete, 
  loading = {},
  showActions = true 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleCrawl = () => {
    if (onCrawl) onCrawl(website.id);
  };

  const handleRecrawl = () => {
    if (onRecrawl) onRecrawl(website.id);
  };

  const handleToggleActive = () => {
    if (onToggleActive) onToggleActive(website.id, !website.isActive);
  };

  const handleDelete = () => {
    if (onDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${website.name}"? This will also delete all crawled content.`
      );
      if (confirmed) {
        onDelete(website.id);
      }
    }
  };

  const canCrawl = website.crawlStatus !== CRAWL_STATUS.CRAWLING && website.isActive;
  const canRecrawl = website.crawlStatus === CRAWL_STATUS.COMPLETED && website.isActive;

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className={classNames(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              website.isActive ? 'bg-primary-100' : 'bg-gray-100'
            )}>
              <GlobeAltIcon className={classNames(
                'w-5 h-5',
                website.isActive ? 'text-primary-600' : 'text-gray-400'
              )} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {website.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {extractDomain(website.url)}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <StatusBadge status={website.crawlStatus} />
              {!website.isActive && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <PauseIcon className="w-3 h-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Toggle details"
            >
              <InformationCircleIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {website.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {website.description}
        </p>
      )}

      {/* Details */}
      {showDetails && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">URL:</span>
              <p className="font-medium text-gray-900 truncate">{website.url}</p>
            </div>
            <div>
              <span className="text-gray-500">Content Count:</span>
              <p className="font-medium text-gray-900">{website.contentCount || 0}</p>
            </div>
            {website.lastCrawled && (
              <div>
                <span className="text-gray-500">Last Crawled:</span>
                <p className="font-medium text-gray-900">
                  {formatDate(website.lastCrawled, DATE_FORMATS.RELATIVE)}
                </p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="font-medium text-gray-900">
                {formatDate(website.createdAt, DATE_FORMATS.SHORT)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {/* Crawl/Recrawl Button */}
            {canCrawl && (
              <LoadingButton
                onClick={handleCrawl}
                loading={loading.crawl}
                className="btn-primary text-sm px-3 py-1.5"
                disabled={!canCrawl}
              >
                <PlayIcon className="w-4 h-4 mr-1" />
                Crawl
              </LoadingButton>
            )}

            {canRecrawl && (
              <LoadingButton
                onClick={handleRecrawl}
                loading={loading.recrawl}
                className="btn-secondary text-sm px-3 py-1.5"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Recrawl
              </LoadingButton>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Toggle Active */}
            <LoadingButton
              onClick={handleToggleActive}
              loading={loading.toggle}
              className={classNames(
                'text-sm px-3 py-1.5',
                website.isActive ? 'btn-secondary' : 'btn-primary'
              )}
            >
              {website.isActive ? (
                <>
                  <PauseIcon className="w-4 h-4 mr-1" />
                  Deactivate
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4 mr-1" />
                  Activate
                </>
              )}
            </LoadingButton>

            {/* Delete Button */}
            <LoadingButton
              onClick={handleDelete}
              loading={loading.delete}
              className="btn-danger text-sm px-3 py-1.5"
            >
              <TrashIcon className="w-4 h-4" />
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteCard;