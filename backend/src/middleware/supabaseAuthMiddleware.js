const { getSupabaseAdmin } = require('../config/supabase');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware to protect routes with Supabase authentication
 * Verifies the JWT token from the Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    // Verify the JWT token using Supabase Admin
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.error('Supabase auth middleware error', { 
        error: error?.message || 'User not found' 
      });
      return errorResponse(res, 401, 'Not authorized, invalid token');
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      emailVerified: user.email_confirmed_at !== null,
    };
    
    next();

  } catch (error) {
    logger.error('Supabase auth middleware error', { error: error.message });
    return errorResponse(res, 401, 'Not authorized, token verification failed');
  }
};

/**
 * Middleware to check user role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.user;
      const supabase = getSupabaseAdmin();

      // Get user data from users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !userData) {
        logger.error('Role check error', { error: error?.message || 'User not found' });
        return errorResponse(res, 403, 'User not found');
      }

      const userRole = userData.role || 'DOCTOR';

      if (!allowedRoles.includes(userRole)) {
        return errorResponse(res, 403, 'Access denied: insufficient permissions');
      }

      req.user.role = userRole;
      next();

    } catch (error) {
      logger.error('Role check error', { error: error.message });
      return errorResponse(res, 500, 'Authorization check failed');
    }
  };
};

module.exports = { protect, checkRole };