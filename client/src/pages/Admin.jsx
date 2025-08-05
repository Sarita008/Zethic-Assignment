import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import UserStats from '../components/dashboard/UserStats';
import Analytics from '../components/dashboard/Analytics';
import WebsiteCard from '../components/website/WebsiteCard';
import WebsiteForm from '../components/website/WebsiteForm';
import Loading, { LoadingButton } from '../components/common/Loading';
import websiteService from '../services/websiteService';
import userService from '../services/userService';
import analyticsService from '../services/analyticsService';
import { formatDate, formatNumber, truncateText, classNames } from '../utils/helpers';
import { DATE_FORMATS, CRAWL_STATUS, CRAWL_STATUS_COLORS } from '../utils/constants';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  
  // UI states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [websiteSearch, setWebsiteSearch] = useState('');
  const [websiteFilter, setWebsiteFilter] = useState('all');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsResponse, usersResponse, websitesResponse, healthResponse] = await Promise.all([
        analyticsService.getDashboardStats(),
        userService.getAllUsers(1, 50),
        websiteService.getAllWebsites(),
        analyticsService.getSystemHealth()
      ]);
      
      setDashboardStats(statsResponse);
      setUsers(usersResponse?.users || []);
      setWebsites(websitesResponse?.websites || []);
      setSystemHealth(healthResponse);
      
    } catch (err) {
      console.log(err);
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWebsite = async (websiteData) => {
    setActionLoading(prev => ({ ...prev, createWebsite: true }));

    try {
      const response = await websiteService.createWebsite(websiteData);
      setWebsites(prev => [response.website, ...prev]);
      setShowWebsiteForm(false);
    } catch (error) {
      console.error('Failed to create website:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, createWebsite: false }));
    }
  };

  const handleCrawlWebsite = async (websiteId) => {
    setActionLoading(prev => ({ ...prev, [`crawl-${websiteId}`]: true }));

    try {
      await websiteService.crawlWebsite(websiteId);
      setWebsites(prev => prev.map(w => 
        w.id === websiteId 
          ? { ...w, crawlStatus: CRAWL_STATUS.CRAWLING }
          : w
      ));
    } catch (error) {
      console.error('Failed to start crawling:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`crawl-${websiteId}`]: false }));
    }
  };

  const handleDeleteWebsite = async (websiteId) => {
    setActionLoading(prev => ({ ...prev, [`delete-${websiteId}`]: true }));

    try {
      await websiteService.deleteWebsite(websiteId);
      setWebsites(prev => prev.filter(w => w.id !== websiteId));
    } catch (error) {
      console.error('Failed to delete website:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${websiteId}`]: false }));
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'users', name: 'Users', icon: UsersIcon },
    { id: 'websites', name: 'Websites', icon: GlobeAltIcon },
    { id: 'system', name: 'System Health', icon: Cog6ToothIcon }
  ];

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredWebsites = websites.filter(website => {
    const matchesSearch = website.name.toLowerCase().includes(websiteSearch.toLowerCase()) ||
                         website.url.toLowerCase().includes(websiteSearch.toLowerCase());
    
    if (websiteFilter === 'all') return matchesSearch;
    if (websiteFilter === 'active') return matchesSearch && website.isActive;
    if (websiteFilter === 'inactive') return matchesSearch && !website.isActive;
    return matchesSearch && website.crawlStatus === websiteFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading text="Loading admin dashboard..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Failed to load admin dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={loadInitialData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage users, websites, and monitor system performance
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    'flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <UserStats stats={dashboardStats?.overview} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Analytics
                data={dashboardStats?.charts?.dailyQueries?.map(item => ({
                  date: item._id,
                  count: item.count
                })) || []}
                type="line"
                title="Daily Query Trends"
              />
              
              <Analytics
                data={dashboardStats?.charts?.topWebsites?.map(item => ({
                  name: item.name,
                  value: item.queryCount
                })) || []}
                type="bar"
                title="Most Queried Websites"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setActiveTab('websites')}
                className="card p-6 hover:shadow-md transition-shadow cursor-pointer group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Manage Websites</h3>
                    <p className="text-gray-600 text-sm">Add, edit, and monitor websites</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className="card p-6 hover:shadow-md transition-shadow cursor-pointer group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <UsersIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">View Users</h3>
                    <p className="text-gray-600 text-sm">Monitor user activity</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('system')}
                className="card p-6 hover:shadow-md transition-shadow cursor-pointer group text-left"
              >
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Cog6ToothIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                    <p className="text-gray-600 text-sm">Monitor system status</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Users Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
                <p className="text-gray-600">Manage and monitor user accounts</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="input-field pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Queries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
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
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatNumber(user.totalQueries)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.lastActiveAt 
                              ? formatDate(user.lastActiveAt, DATE_FORMATS.RELATIVE)
                              : 'Never'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(user.createdAt, DATE_FORMATS.SHORT)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'websites' && (
          <div className="space-y-6">
            {/* Websites Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Websites</h2>
                <p className="text-gray-600">Manage crawled websites and monitor status</p>
              </div>
              
              <button
                onClick={() => setShowWebsiteForm(true)}
                className="btn-primary flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Website
              </button>
            </div>

            {/* Website Filters */}
            <div className="card p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search websites..."
                    value={websiteSearch}
                    onChange={(e) => setWebsiteSearch(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="w-4 h-4 text-gray-500" />
                    <select
                      value={websiteFilter}
                      onChange={(e) => setWebsiteFilter(e.target.value)}
                      className="input-field text-sm py-1.5"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value={CRAWL_STATUS.PENDING}>Pending</option>
                      <option value={CRAWL_STATUS.CRAWLING}>Crawling</option>
                      <option value={CRAWL_STATUS.COMPLETED}>Completed</option>
                      <option value={CRAWL_STATUS.FAILED}>Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Websites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWebsites.map((website) => (
                <WebsiteCard
                  key={website.id}
                  website={website}
                  onCrawl={handleCrawlWebsite}
                  onDelete={handleDeleteWebsite}
                  loading={{
                    crawl: actionLoading[`crawl-${website.id}`],
                    delete: actionLoading[`delete-${website.id}`]
                  }}
                />
              ))}
            </div>

            {filteredWebsites.length === 0 && (
              <div className="text-center py-12">
                <GlobeAltIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No websites found
                </h3>
                <p className="text-gray-600 mb-4">
                  {websiteSearch || websiteFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first website'
                  }
                </p>
                {!websiteSearch && websiteFilter === 'all' && (
                  <button
                    onClick={() => setShowWebsiteForm(true)}
                    className="btn-primary"
                  >
                    Add Website
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">System Health</h2>
              <p className="text-gray-600">Monitor system performance and status</p>
            </div>

            {systemHealth && (
              <>
                {/* Database Status */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    Database Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(systemHealth.database.collections.users)}
                      </p>
                      <p className="text-sm text-gray-500">Users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(systemHealth.database.collections.websites)}
                      </p>
                      <p className="text-sm text-gray-500">Websites</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(systemHealth.database.collections.crawledContent)}
                      </p>
                      <p className="text-sm text-gray-500">Content</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(systemHealth.database.collections.chatHistory)}
                      </p>
                      <p className="text-sm text-gray-500">Chats</p>
                    </div>
                  </div>
                </div>

                {/* Crawling Status */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Crawling Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ArrowPathIcon className="w-5 h-5 text-blue-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-900">
                          {systemHealth.crawling.active}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Active</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-900">
                          {systemHealth.crawling.completed}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Completed</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <XCircleIcon className="w-5 h-5 text-red-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-900">
                          {systemHealth.crawling.failed}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Failed</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ClockIcon className="w-5 h-5 text-yellow-500 mr-1" />
                        <span className="text-2xl font-bold text-gray-900">
                          {systemHealth.crawling.pending}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(systemHealth.activity.last24h)}
                      </p>
                      <p className="text-sm text-gray-500">Last 24 hours</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(systemHealth.activity.last7days)}
                      </p>
                      <p className="text-sm text-gray-500">Last 7 days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(systemHealth.activity.last30days)}
                      </p>
                      <p className="text-sm text-gray-500">Last 30 days</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Website Form Modal */}
        {showWebsiteForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowWebsiteForm(false)} />
              <div className="relative bg-white rounded-lg max-w-2xl w-full">
                <WebsiteForm
                  onSubmit={handleCreateWebsite}
                  onCancel={() => setShowWebsiteForm(false)}
                  loading={actionLoading.createWebsite}
                />
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowUserModal(false)} />
              <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {selectedUser.profileImage ? (
                      <img
                        src={selectedUser.profileImage}
                        alt={selectedUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Queries</p>
                      <p className="font-medium">{formatNumber(selectedUser.totalQueries)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Member Since</p>
                      <p className="font-medium">{formatDate(selectedUser.createdAt, DATE_FORMATS.SHORT)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Active</p>
                      <p className="font-medium">
                        {selectedUser.lastActiveAt 
                          ? formatDate(selectedUser.lastActiveAt, DATE_FORMATS.RELATIVE)
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;