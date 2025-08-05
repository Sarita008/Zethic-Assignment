const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiter for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: 'Too many AI requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Crawler rate limiter
const crawlerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 crawl requests per 5 minutes
  message: {
    success: false,
    message: 'Too many crawl requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generalLimiter,
  aiLimiter,
  crawlerLimiter
};