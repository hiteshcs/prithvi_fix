const rateLimit = require('express-rate-limit');

/**
 * Tiered Rate Limiters for Prithvi Fix Backend API.
 * Mitigates Brute-Force, Credential Stuffing, and Denial of Service (DoS).
 */

// Helper to determine if IP is local/development
function isLocalOrDev(req) {
  const ip = req.ip || req.connection?.remoteAddress || '';
  return (
    process.env.NODE_ENV !== 'production' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip === 'localhost'
  );
}

// 1. Authentication Limiter (Login & Registration)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Generous limit
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => isLocalOrDev(req), // Completely bypass for local / developer IP
  message: {
    error: 'Too Many Requests',
    message: 'Too many login / registration attempts from this IP address. Please wait 15 minutes before trying again.',
    status: 429,
  },
});

// 2. OTP Verification Limiter
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 OTP attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many OTP verification attempts. For your security, access is temporarily throttled. Please try again in 10 minutes.',
    status: 429,
  },
});

// 3. AI Chatbot Assistant Limiter
const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 chat queries per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'AI Assistant query rate limit reached. Please wait a moment before sending more messages.',
    status: 429,
  },
});

// 4. General API Limiter
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests generated from this client. Please slow down.',
    status: 429,
  },
});

module.exports = {
  authLimiter,
  otpLimiter,
  aiChatLimiter,
  generalLimiter,
};
