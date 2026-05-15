// Simple in-memory rate limiting for Convex HTTP endpoints
// Note: In-memory limits reset on server restart. For production, use a database-backed solution.

const rateLimits = new Map();

/**
 * Check if a request is within rate limits
 * @param {string} ip - Client IP address
 * @param {string} endpoint - API endpoint being accessed
 * @param {number} limit - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute)
 * @returns {boolean} - true if allowed, false if rate limited
 */
export function checkRateLimit(ip, endpoint, limit = 10, windowMs = 60000) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const data = rateLimits.get(key);
  
  // Reset if window expired
  if (now > data.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  // Check if limit exceeded
  if (data.count >= limit) {
    return false;
  }
  
  // Increment count
  data.count++;
  return true;
}

/**
 * Get client IP from request headers
 * @param {Request} req - HTTP request object
 * @returns {string} - Client IP address
 */
export function getClientIp(req) {
  // Try common proxy headers
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

/**
 * Rate limit configuration for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints (strict limits)
  '/auth/login': { limit: 5, windowMs: 60000 },      // 5 attempts per minute
  '/auth/register': { limit: 3, windowMs: 60000 },   // 3 registrations per minute
  '/auth/refresh': { limit: 10, windowMs: 60000 },   // 10 refreshes per minute
  
  // Content endpoints (more generous)
  '/clips': { limit: 30, windowMs: 60000 },          // 30 clips per minute
  '/auth/me': { limit: 60, windowMs: 60000 },        // 60 user info requests per minute
  '/auth/logout': { limit: 20, windowMs: 60000 },    // 20 logouts per minute
};

/**
 * Apply rate limiting to a request
 * @param {Request} req - HTTP request object
 * @param {string} path - Request path
 * @returns {Object|null} - null if allowed, error response if rate limited
 */
export function applyRateLimit(req, path) {
  const ip = getClientIp(req);
  const config = RATE_LIMITS[path];
  
  if (!config) {
    // No rate limit configured for this endpoint
    return null;
  }
  
  if (!checkRateLimit(ip, path, config.limit, config.windowMs)) {
    return {
      status: 429,
      body: { error: "Too many requests, please try again later" }
    };
  }
  
  return null;
}

// Clean up old rate limits periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimits.entries()) {
    if (now > data.resetTime + 300000) { // 5 minutes after reset
      rateLimits.delete(key);
    }
  }
}, 300000);