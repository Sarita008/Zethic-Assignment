import { useState, useRef, useEffect } from 'react';
import { 
  ChatBubbleLeftIcon,
  PaperAirplaneIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useChat } from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import WebsiteSelector from './WebsiteSelector';
import Loading from '../common/Loading';
import { VALIDATION_RULES } from '../../utils/constants';
import { classNames } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ChatInterface = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState(null);
  
  const {
    messages,
    loading,
    sending,
    hasMore,
    sendMessage,
    loadMoreMessages,
    deleteMessage,
    refreshMessages
  } = useChat(user?.id, selectedWebsite?.id);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [question]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedWebsite) {
      setError('Please select a website first');
      return;
    }

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (question.length > VALIDATION_RULES.QUESTION.MAX_LENGTH) {
      setError(`Question is too long (max ${VALIDATION_RULES.QUESTION.MAX_LENGTH} characters)`);
      return;
    }

    setError(null);

    try {
      await sendMessage(question.trim());
      setQuestion('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMoreMessages();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please create a profile first to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Website Selection */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <WebsiteSelector
          selectedWebsite={selectedWebsite}
          onWebsiteSelect={setSelectedWebsite}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          {/* Load More Button */}
          {hasMore && messages.length > 0 && (
            <div className="text-center mb-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-white border border-primary-300 rounded-md hover:bg-primary-50 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loading size="sm" className="mr-2" />
                ) : (
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                )}
                Load More Messages
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && messages.length === 0 && (
            <div className="py-12">
              <Loading text="Loading messages..." />
            </div>
          )}

          {/* Empty State */}
          {!loading && messages.length === 0 && selectedWebsite && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 mb-4">
                Ask me anything about {selectedWebsite.name}
              </p>
            </div>
          )}

          {/* Messages List */}
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                user={user}
                onDelete={deleteMessage}
              />
            ))}
          </div>

          {/* Typing Indicator */}
          {sending && (
            <div className="flex justify-start mt-6">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="message-bubble message-ai">
                  <div className="loading-dots text-gray-600">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedWebsite 
                    ? `Ask a question about ${selectedWebsite.name}...`
                    : 'Select a website first...'
                }
                disabled={!selectedWebsite || sending}
                rows={1}
                className={classNames(
                  'w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                  !selectedWebsite || sending
                    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                    : 'border-gray-300'
                )}
                style={{ maxHeight: '120px' }}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>
                  {question.length}/{VALIDATION_RULES.QUESTION.MAX_LENGTH}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedWebsite || !question.trim() || sending}
              className={classNames(
                'p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                !selectedWebsite || !question.trim() || sending
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              )}
            >
              {sending ? (
                <Loading size="sm" color="white" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;