// Hybrid rate limiting for Convex HTTP endpoints
// Uses IP + UserID for authenticated endpoints, IP-only for unauthenticated
// Note: In-memory limits reset on server restart. For production, use a database-backed solution.

const rateLimits = new Map();

/**
 * Check if a request is within rate limits
 * @param {string} identifier - IP, UserID, or IP+UserID combination
 * @param {string} endpoint - API endpoint being accessed
 * @param {number} limit - Maximum requests allowed in the window
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute)
 * @returns {boolean} - true if allowed, false if rate limited
 */
function checkRateLimit(identifier, endpoint, limit = 10, windowMs = 60000) {
  cleanupExpired(); // clean on every check instead of setInterval
  const key = `${identifier}:${endpoint}`;
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
  // Unauthenticated endpoints (IP-only, more generous for shared networks)
  '/auth/login': { 
    ipLimit: 20,           // 20 attempts per minute per IP (shared networks)
    userLimit: 5,          // 5 attempts per minute per user (when authenticated)
    windowMs: 60000 
  },
  '/auth/register': { 
    ipLimit: 10,           // 10 registrations per minute per IP
    userLimit: 3,          // 3 registrations per minute per user
    windowMs: 60000 
  },
  
  // Authenticated endpoints (UserID + IP hybrid)
  '/auth/refresh': { 
    ipLimit: 30,           // 30 refreshes per minute per IP
    userLimit: 10,         // 10 refreshes per minute per user
    windowMs: 60000 
  },
  '/clips': { 
    ipLimit: 100,          // 100 clips per minute per IP
    userLimit: 30,         // 30 clips per minute per user
    windowMs: 60000 
  },
  '/auth/me': { 
    ipLimit: 120,          // 120 requests per minute per IP
    userLimit: 60,         // 60 requests per minute per user
    windowMs: 60000 
  },
  '/auth/logout': { 
    ipLimit: 40,           // 40 logouts per minute per IP
    userLimit: 20,         // 20 logouts per minute per user
    windowMs: 60000 
  },
};

/**
 * Apply hybrid rate limiting to a request
 * @param {Request} req - HTTP request object
 * @param {string} path - Request path
 * @param {string|null} userId - User ID if authenticated, null otherwise
 * @returns {Object|null} - null if allowed, error response if rate limited
 */
export function applyRateLimit(req, path, userId = null) {
  const ip = getClientIp(req);
  const config = RATE_LIMITS[path];
  
  if (!config) {
    // No rate limit configured for this endpoint
    return null;
  }
  
  // For unauthenticated endpoints, use IP-only
  if (!userId || path === '/auth/login' || path === '/auth/register') {
    if (!checkRateLimit(ip, `${path}:ip`, config.ipLimit, config.windowMs)) {
      return {
        status: 429,
        body: { error: "Too many requests from your network, please try again later" }
      };
    }
    return null;
  }
  
  // For authenticated endpoints, check both UserID and IP limits
  const userKey = `${userId}:${path}`;
  const ipKey = `${ip}:${path}:ip`;
  
  // Check user-specific limit (primary)
  if (!checkRateLimit(userKey, `${path}:user`, config.userLimit, config.windowMs)) {
    return {
      status: 429,
      body: { error: "Too many requests from your account, please slow down" }
    };
  }
  
  // Check IP limit as fallback (prevents single user from overwhelming shared IP)
  if (!checkRateLimit(ipKey, `${path}:ip`, config.ipLimit, config.windowMs)) {
    return {
      status: 429,
      body: { error: "Too many requests from your network, please try again later" }
    };
  }
  
  return null;
}

// Clean up old rate limits on each check to prevent unbounded memory growth
function cleanupExpired() {
  const now = Date.now();
  for (const [key, data] of rateLimits.entries()) {
    if (now > data.resetTime + 300000) {
      rateLimits.delete(key);
    }
  }
}