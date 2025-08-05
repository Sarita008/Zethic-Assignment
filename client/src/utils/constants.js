export const API_ENDPOINTS = {
  USERS: '/users',
  CHAT: '/chat',
  WEBSITES: '/websites',
  CRAWLER: '/crawler',
  ANALYTICS: '/analytics',
};

export const STORAGE_KEYS = {
  USER_ID: 'userId',
  USER_DATA: 'userData',
  SELECTED_WEBSITE: 'selectedWebsite',
  CHAT_HISTORY: 'chatHistory',
};

export const CRAWL_STATUS = {
  PENDING: 'pending',
  CRAWLING: 'crawling',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const CRAWL_STATUS_COLORS = {
  [CRAWL_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [CRAWL_STATUS.CRAWLING]: 'bg-blue-100 text-blue-800',
  [CRAWL_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [CRAWL_STATUS.FAILED]: 'bg-red-100 text-red-800',
};

export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
};

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
};

export const DATE_FORMATS = {
  FULL: 'PPpp',
  DATE_ONLY: 'PP',
  TIME_ONLY: 'p',
  SHORT: 'MMM d, yyyy',
  RELATIVE: 'relative',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  QUESTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
  },
  WEBSITE_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
};