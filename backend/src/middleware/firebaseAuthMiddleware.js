const { getAuth } = require('../config/firebase');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    
    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
    
    next();

  } catch (error) {
    logger.error('Firebase auth middleware error', { error: error.message });
    
    if (error.code === 'auth/id-token-expired') {
      return errorResponse(res, 401, 'Not authorized, token expired');
    }
    if (error.code === 'auth/argument-error') {
      return errorResponse(res, 401, 'Not authorized, invalid token format');
    }
    
    return errorResponse(res, 401, 'Not authorized, invalid token');
  }
};

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.user;
      const { getFirestore } = require('../config/firebase');
      const db = getFirestore();

      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return errorResponse(res, 403, 'User not found');
      }

      const userData = userDoc.data();
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
