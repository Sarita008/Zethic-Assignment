import { classNames } from '../../utils/helpers';

const Loading = ({ 
  size = 'md', 
  color = 'primary', 
  text = '', 
  overlay = false,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600'
  };

  const Spinner = () => (
    <svg
      className={classNames(
        'animate-spin',
        sizes[size],
        colors[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner />
          {text && (
            <p className="mt-4 text-gray-600 text-sm font-medium">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('flex items-center justify-center', className)}>
      {text ? (
        <div className="flex items-center space-x-3">
          <Spinner />
          <span className="text-gray-600 text-sm font-medium">{text}</span>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export const LoadingButton = ({ 
  loading = false, 
  children, 
  className = '', 
  disabled = false,
  ...props 
}) => {
  return (
    <button
      className={classNames(
        'relative transition-opacity duration-200',
        loading && 'opacity-75 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  );
};

export const LoadingCard = ({ text = 'Loading...', className = '' }) => (
  <div className={classNames('card p-8', className)}>
    <Loading text={text} />
  </div>
);

export const LoadingTable = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="animate-pulse flex space-x-4">
        {Array.from({ length: cols }, (_, j) => (
          <div
            key={j}
            className="bg-gray-200 rounded h-4 flex-1"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    ))}
  </div>
);

export default Loading;