import { 
  UserCircleIcon, 
  ChatBubbleLeftIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatNumber } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

const ProfileCard = ({ user, stats = null, className = '' }) => {
  if (!user) return null;

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
              <UserCircleIcon className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {user.name}
            </h2>
            <p className="text-gray-600 truncate">{user.email}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftIcon className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500">Total Queries</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(user.totalQueries)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(user.createdAt, DATE_FORMATS.SHORT)}
                </p>
              </div>
            </div>

            {user.lastActiveAt && (
              <div className="flex items-center space-x-2 col-span-2">
                <ClockIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(user.lastActiveAt, DATE_FORMATS.RELATIVE)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Stats */}
          {stats && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {stats.avgResponseTime && (
                  <div>
                    <p className="text-gray-500">Avg Response Time</p>
                    <p className="font-medium text-gray-900">
                      {Math.round(stats.avgResponseTime)}ms
                    </p>
                  </div>
                )}
                {stats.avgRelevanceScore && (
                  <div>
                    <p className="text-gray-500">Relevance Score</p>
                    <p className="font-medium text-gray-900">
                      {Math.round(stats.avgRelevanceScore * 100)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;