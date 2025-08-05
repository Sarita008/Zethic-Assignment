import { useState } from 'react';
import { 
  UserCircleIcon, 
  ChatBubbleLeftIcon,
  ClockIcon,
  TrashIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatDuration } from '../../utils/helpers';
import { DATE_FORMATS } from '../../utils/constants';

const MessageBubble = ({ 
  message, 
  user, 
  onDelete = null, 
  showActions = true 
}) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || deleting) return;

    const confirmed = window.confirm('Are you sure you want to delete this message?');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete(message._id);
    } catch (error) {
      console.error('Delete failed:', error);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* User Question */}
      <div className="flex justify-end">
        <div className="flex items-start space-x-3 max-w-3xl">
          <div className="message-bubble message-user">
            <p className="text-sm">{message.question}</p>
          </div>
          
          <div className="flex-shrink-0">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex justify-start">
        <div className="flex items-start space-x-3 max-w-3xl">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <ChatBubbleLeftIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="message-bubble message-ai">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm whitespace-pre-wrap">{message.answer}</p>
          </div>
        </div>

        {/* Message Metadata */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formatDate(message.createdAt, DATE_FORMATS.RELATIVE)}</span>
            </div>
            
            {message.responseTime && (
              <span>
                Response: {formatDuration(message.responseTime)}
              </span>
            )}

            {message.relevanceScore && (
              <span>
                Relevance: {Math.round(message.relevanceScore * 100)}%
              </span>
            )}
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(message.answer)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <CheckIcon className="w-3 h-3 text-green-600" />
                ) : (
                  <ClipboardDocumentIcon className="w-3 h-3" />
                )}
              </button>

              {onDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors disabled:opacity-50"
                  title="Delete message"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
);
};
export default MessageBubble;