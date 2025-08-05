import { 
  UsersIcon, 
  ChatBubbleLeftIcon, 
  GlobeAltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { formatNumber, formatDate } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  const changeColors = change >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {formatNumber(value)}
            </p>
            {change !== undefined && (
              <p className={`ml-2 text-sm font-medium ${changeColors}`}>
                {change >= 0 ? '+' : ''}{change}%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserStats = ({ stats, className = '' }) => {
  if (!stats) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: UsersIcon,
      color: 'blue'
    },
    {
      title: 'Total Queries',
      value: stats.totalQueries || 0,
      icon: ChatBubbleLeftIcon,
      color: 'green'
    },
    {
      title: 'Active Websites',
      value: stats.activeWebsites || 0,
      icon: GlobeAltIcon,
      color: 'purple'
    },
    {
      title: 'Total Websites',
      value: stats.totalWebsites || 0,
      icon: ChartBarIcon,
      color: 'orange'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

const UserActivityList = ({ users, className = '' }) => {
  if (!users || users.length === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
        <p className="text-gray-500 text-center py-8">No users found</p>
      </div>
    );
  }

  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user._id} className="flex items-center space-x-3 py-2">
            <div className="flex-shrink-0">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatNumber(user.totalQueries)} queries
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(user.createdAt, DATE_FORMATS.RELATIVE)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { UserStats, UserActivityList };
export default UserStats;