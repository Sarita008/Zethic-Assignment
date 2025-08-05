import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import UserForm from '../components/user/UserForm';
import ProfileCard from '../components/user/ProfileCard';
import Analytics from '../components/dashboard/Analytics';
import Loading from '../components/common/Loading';
import analyticsService from '../services/analyticsService';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { 
    isAuthenticated,
    user, 
    loading: userLoading, 
    createUser, 
    updateUser, 
    refreshUser 
  } = useAuth();
  
  const [formMode, setFormMode] = useState(isAuthenticated ? 'view' : 'create');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user && formMode === 'view') {
      loadUserAnalytics();
    }
  }, [user, formMode]);

  const loadUserAnalytics = async () => {
    if (!user) return;

    setAnalyticsLoading(true);
    try {
      const response = await analyticsService.getUserAnalytics(user.id);
      setAnalytics(response);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleSubmit = async (userData, profileImage) => {
    setSubmitLoading(true);
    setMessage(null);

    try {
      if (formMode === 'create') {
        const newUser = await createUser(userData, profileImage);
        setMessage({
          type: 'success',
          text: 'Profile created successfully! You can now start chatting.'
        });
        setFormMode('view');
        
        // Redirect to chat after a short delay
        setTimeout(() => {
          navigate('/chat');
        }, 2000);
      } else {
        await updateUser(userData, profileImage);
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });
        setFormMode('view');
        await refreshUser();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderMessage = () => {
    if (!message) return null;

    const isSuccess = message.type === 'success';
    const Icon = isSuccess ? CheckCircleIcon : ExclamationCircleIcon;
    const bgColor = isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
    const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
    const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';

    return (
      <div className={`p-4 rounded-md border ${bgColor} mb-6`}>
        <div className="flex items-center">
          <Icon className={`w-5 h-5 ${iconColor} mr-2`} />
          <p className={`text-sm font-medium ${textColor}`}>
            {message.text}
          </p>
        </div>
      </div>
    );
  };

  const chartData = analytics?.dailyDistribution?.map(item => ({
    date: item._id,
    count: item.count
  })) || [];

  const websiteUsageData = analytics?.websiteUsage?.map(item => ({
    name: item.websiteName,
    value: item.queryCount
  })) || [];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading text="Loading profile..." overlay />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {formMode === 'create' ? 'Create Your Profile' : 'Profile'}
          </h1>
          <p className="text-gray-600 mt-1">
            {formMode === 'create' 
              ? 'Get started by creating your profile'
              : 'Manage your account and view your activity'
            }
          </p>
        </div>

        {renderMessage()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form/Card */}
          <div className="lg:col-span-1">
            {formMode === 'view' && user ? (
              <div className="space-y-6">
                <ProfileCard 
                  user={user} 
                  stats={analytics?.overview}
                />
                <div className="card p-4">
                  <button
                    onClick={() => setFormMode('edit')}
                    className="btn-secondary w-full"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-6">
                <div className="flex items-center mb-6">
                  <UserCircleIcon className="w-8 h-8 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {formMode === 'create' ? 'Profile Information' : 'Edit Profile'}
                  </h2>
                </div>
                
                <UserForm
                  user={formMode === 'edit' ? user : null}
                  onSubmit={handleSubmit}
                  loading={submitLoading}
                  buttonText={formMode === 'create' ? 'Create Profile' : 'Update Profile'}
                />

                {formMode === 'edit' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setFormMode('view');
                        setMessage(null);
                      }}
                      className="btn-secondary w-full"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analytics */}
          {formMode === 'view' && user && (
            <div className="lg:col-span-2 space-y-6">
              {analyticsLoading ? (
                <div className="card p-6">
                  <Loading text="Loading analytics..." />
                </div>
              ) : analytics ? (
                <>
                  {/* Query Trends */}
                  {chartData.length > 0 && (
                    <Analytics
                      data={chartData}
                      type="line"
                      title="Your Query Activity"
                    />
                  )}

                  {/* Website Usage */}
                  {websiteUsageData.length > 0 && (
                    <Analytics
                      data={websiteUsageData}
                      type="bar"
                      title="Websites You've Explored"
                    />
                  )}

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-6">
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <ChartBarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Average Response Time</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {analytics.overview.avgResponseTime 
                              ? Math.round(analytics.overview.avgResponseTime) + 'ms'
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Average Relevance</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {analytics.overview.avgRelevanceScore 
                              ? Math.round(analytics.overview.avgRelevanceScore * 100) + '%'
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card p-6 text-center">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Start chatting to see your analytics
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call to Action for New Users */}
        {formMode === 'view' && user && analytics?.overview?.totalQueries === 0 && (
          <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Start?</h3>
              <p className="text-primary-100 mb-4">
                Your profile is all set up! Start chatting with websites to see your analytics.
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="btn-secondary bg-white text-primary-600 hover:bg-gray-100"
              >
                Start Chatting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;