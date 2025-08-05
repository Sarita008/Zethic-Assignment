import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import ChatInterface from '../components/chat/ChatInterface';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const {isAuthenticated} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Cleanup storage on component mount
    const cleanup = () => {
      // Clean up old cached data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_') || key.startsWith('chatHistory_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.timestamp && Date.now() - data.timestamp > 30 * 60 * 1000) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            localStorage.removeItem(key);
          }
        }
      });
    };

    cleanup();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Profile Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please create a profile first to start chatting with websites.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            AI Chat Assistant
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Ask questions about any crawled website and get intelligent answers
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default Chat;