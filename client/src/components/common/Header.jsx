import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftIcon, 
  ChartBarIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/helpers';
import { LoadingButton } from './Loading';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation items based on authentication status
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: ChartBarIcon, public: true }
    ];

    if (isAuthenticated) {
      baseItems.push(
        { name: 'Chat', href: '/chat', icon: ChatBubbleLeftIcon, protected: true },
        { name: 'Profile', href: '/profile', icon: UserCircleIcon, protected: true }
      );

      // Add admin link for admin users
      if (user?.role === 'admin') {
        baseItems.push({
          name: 'Admin',
          href: '/admin',
          icon: ShieldCheckIcon,
          protected: true,
          adminOnly: true
        });
      }
    }

    return baseItems;
  };

  const navigation = getNavigationItems();

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/profile');
  };

  const handleAdminClick = () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/admin');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
                <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                AI Crawler
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                    item.adminOnly && 'ring-1 ring-primary-200'
                  )}
                >
                  <Icon className={classNames(
                    'w-4 h-4',
                    active ? 'text-primary-600' : 'text-gray-500'
                  )} />
                  <span>{item.name}</span>
                  {item.adminOnly && (
                    <ShieldCheckIcon className="w-3 h-3 text-primary-500" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <div className="flex items-center space-x-2">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="w-5 h-5 text-primary-600" />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-24">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        {user?.role === 'admin' && (
                          <ShieldCheckIcon className="w-3 h-3 mr-1" />
                        )}
                        {user?.totalQueries || 0} queries
                      </p>
                    </div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        {user?.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                            <ShieldCheckIcon className="w-3 h-3 mr-1" />
                            Administrator
                          </span>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={handleProfileClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                        >
                          <UserCircleIcon className="w-4 h-4 mr-3 text-gray-500" />
                          Profile Settings
                        </button>

                        {user?.role === 'admin' && (
                          <button
                            onClick={handleAdminClick}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center transition-colors"
                          >
                            <Cog6ToothIcon className="w-4 h-4 mr-3 text-gray-500" />
                            Admin Dashboard
                          </button>
                        )}

                        <div className="border-t border-gray-100 my-1" />

                        <LoadingButton
                          onClick={handleLogout}
                          loading={isLoggingOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-500" />
                          {isLoggingOut ? 'Signing out...' : 'Sign out'}
                        </LoadingButton>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary flex items-center text-sm"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={classNames(
                      'flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors',
                      active
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                      item.adminOnly && 'ring-1 ring-primary-200'
                    )}
                  >
                    <Icon className={classNames(
                      'w-5 h-5',
                      active ? 'text-primary-600' : 'text-gray-500'
                    )} />
                    <span>{item.name}</span>
                    {item.adminOnly && (
                      <ShieldCheckIcon className="w-4 h-4 text-primary-500" />
                    )}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile User Section */}
            {isAuthenticated ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-3 py-2">
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-base font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      {user?.role === 'admin' && (
                        <ShieldCheckIcon className="w-3 h-3 mr-1" />
                      )}
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user?.totalQueries || 0} queries
                    </p>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md flex items-center transition-colors"
                  >
                    <UserCircleIcon className="w-5 h-5 mr-3 text-gray-500" />
                    Profile Settings
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-base text-gray-700 hover:bg-gray-100 rounded-md flex items-center transition-colors"
                    >
                      <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500" />
                      Admin Dashboard
                    </button>
                  )}

                  <LoadingButton
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    loading={isLoggingOut}
                    className="w-full text-left px-3 py-2 text-base text-red-700 hover:bg-red-50 rounded-md flex items-center transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-red-500" />
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </LoadingButton>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;