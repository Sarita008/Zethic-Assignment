import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import UserStats from '../components/dashboard/UserStats';
import { UserActivityList } from '../components/dashboard/UserStats';
import RecentQueries from '../components/dashboard/RecentQueries';
import Analytics from '../components/dashboard/Analytics';
import Loading from '../components/common/Loading';
import analyticsService from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getDashboardStats();
      setDashboardData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <UserStats />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <Loading text="Loading analytics..." />
            </div>
            <div className="card p-6">
              <Loading text="Loading recent activity..." />
            </div>
          </div>
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
            Failed to load dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={handleRetry} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const chartData = dashboardData?.charts?.dailyQueries?.map(item => ({
    date: item._id,
    count: item.count
  })) || [];

  const topWebsitesData = dashboardData?.charts?.topWebsites?.map(item => ({
    name: item.name,
    value: item.queryCount
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isAuthenticated ? `Welcome back, ${user.name}!` : 'Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor your AI-powered web crawler analytics
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Link
                to="/chat"
                className="btn-primary flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Start Chat
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Card for New Users */}
        {!isAuthenticated && (
          <div className="mb-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Get Started with AI Crawler
                </h2>
                <p className="text-primary-100 mb-4">
                  Create your profile and start chatting with websites instantly
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 bg-white text-primary-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Create Profile
                </Link>
              </div>
              <div className="hidden md:block">
                <ChartBarIcon className="w-20 h-20 text-primary-300" />
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <UserStats stats={dashboardData?.overview} className="mb-8" />

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Queries Chart */}
          <Analytics
            data={chartData}
            type="line"
            title="Daily Query Trends"
          />

          {/* Top Websites Chart */}
          <Analytics
            data={topWebsitesData}
            type="bar"
            title="Most Queried Websites"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <UserActivityList 
            users={dashboardData?.recentActivity?.users}
          />

          {/* Recent Queries */}
          <RecentQueries 
            queries={dashboardData?.recentActivity?.queries}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/chat"
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <ArrowTrendingUpIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Start Chatting</h3>
                <p className="text-gray-600 text-sm">Ask questions about websites</p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile"
            className="card p-6 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">View Profile</h3>
                <p className="text-gray-600 text-sm">Manage your account</p>
              </div>
            </div>
          </Link>

          <div className="card p-6 bg-gray-50">
            <div className="flex items-center">
              <div className="p-3 bg-gray-200 rounded-lg">
                <PlusIcon className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-700">Add Website</h3>
                <p className="text-gray-500 text-sm">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;