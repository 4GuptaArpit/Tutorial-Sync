const rateLimit = require('express-rate-limit');

// General rate limiter applied globally to all endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

// Specialized rate limiter for expensive AI generation/analysis API routes
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each user/IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // If authenticated, limit by User ID, otherwise fallback to IP
    return req.user && req.user.id ? req.user.id : req.ip;
  },
  message: {
    message: 'AI quota rate limit reached. Please wait a minute before making another request.'
  }
});

module.exports = {
  generalLimiter,
  aiLimiter
};
