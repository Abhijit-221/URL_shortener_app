const rateLimit = require('express-rate-limit');

const createShortUrlLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each user to 10 requests per window
    message: 'Too many requests, please try again later.',
});

module.exports = { createShortUrlLimiter };
